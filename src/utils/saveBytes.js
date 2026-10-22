// Native .NET BinaryFormatter (NRBF) parser & patcher for MDickie Save.bytes files

/**
 * Parses an MDickie Save.bytes file directly in the browser into a JSON-compatible saveData object
 * along with byte offsets for in-place patching on export.
 *
 * @param {ArrayBuffer} buffer - The raw binary file buffer
 * @returns {{ saveData: Object, offsets: Object, rawBuffer: ArrayBuffer }}
 */
export function parseSaveBytes(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const totalLen = bytes.length;

  // 1. Index all 3-int limb arrays (RecordType 15 = ArraySinglePrimitive)
  // Structure: 0x0f <obj_id: 4B uint32> <length: 4B uint32 = 3> <prim_type: 1B uint8 = 8> <slot0: 4B int32> <slot1: 4B int32> <slot2: 4B int32>
  const limbArrays = new Map();
  for (let i = 0; i <= totalLen - 22; i++) {
    if (bytes[i] === 0x0f) {
      const objId = view.getUint32(i + 1, true);
      const len = view.getUint32(i + 5, true);
      const primType = bytes[i + 9];
      if (len === 3 && primType === 8) {
        const offset0 = i + 10;
        const s0 = view.getInt32(offset0, true);
        const s1 = view.getInt32(offset0 + 4, true);
        const s2 = view.getInt32(offset0 + 8, true);
        limbArrays.set(objId, {
          offsets: [offset0, offset0 + 4, offset0 + 8],
          slots: { "0": s0, "1": s1, "2": s2 },
        });
        i += 21; // skip array payload
      }
    }
  }

  // 2. Find all Character records
  // Character 1 in savedChars is defined with ClassWithMembersAndTypes (tag 0x05, objId 39, class 'Character')
  // All other characters use ClassWithId (tag 0x01, <objId: 4B>, <metaId 39: 4B>, <cid: 4B>, <player: 4B>)
  const charEntries = [];

  // Locate Character 1 (savedChars)
  // Search for 'Character' followed by Keith Manson
  const kmIndex = findBytePattern(bytes, [0x4b, 0x65, 0x69, 0x74, 0x68, 0x20, 0x4d, 0x61, 0x6e, 0x73, 0x6f, 0x6e]);
  if (kmIndex !== -1) {
    const c1Start = kmIndex - 14; // id=1, player=0 starts 14 bytes before Keith Manson string (offset 20493)
    charEntries.push({
      start: c1Start,
      cid: 1,
      player: view.getInt32(c1Start + 4, true),
      isSavedChars: true,
      isC1Saved: true,
    });
  }

  // Search for all other characters using ClassWithId (tag 0x01, metaId = 39)
  for (let i = 0; i <= totalLen - 17; i++) {
    if (bytes[i] === 0x01) {
      const metaId = view.getUint32(i + 5, true);
      if (metaId === 39) {
        const cid = view.getInt32(i + 9, true);
        const player = view.getInt32(i + 13, true);
        if (cid >= 1 && cid <= 350 && player >= 0 && player <= 10) {
          const isSaved = i < 150000;
          charEntries.push({
            start: i,
            cid,
            player,
            isSavedChars: isSaved,
            isC1Saved: false,
          });
        }
      }
    }
  }

  // Sort by starting offset
  charEntries.sort((a, b) => a.start - b.start);

  const savedChars = {};
  const timeChars = {};
  const offsets = { savedChars: {}, timeChars: {} };

  // Helper to read 7-bit encoded length UTF-8 string record (tag 0x06 <objId: 4B> <len: 1B> <chars>)
  const readStringRecord = (offset) => {
    if (bytes[offset] !== 0x06) return { str: "", bytesRead: 0 };
    const len = bytes[offset + 5];
    const textBytes = bytes.subarray(offset + 6, offset + 6 + len);
    const str = new TextDecoder("utf-8").decode(textBytes);
    return { str, bytesRead: 6 + len };
  };

  for (let idx = 0; idx < charEntries.length; idx++) {
    const entry = charEntries[idx];
    const { start, cid, player, isSavedChars, isC1Saved } = entry;
    const rosterKey = isSavedChars ? "savedChars" : "timeChars";
    const targetRoster = isSavedChars ? savedChars : timeChars;
    const targetOffsets = offsets[rosterKey];

    // Determine the end boundary of this character block
    // The next character starts at charEntries[idx + 1].start, or Stock record if last char in savedChars
    let nextBoundary;
    if (idx + 1 < charEntries.length && charEntries[idx + 1].isSavedChars === isSavedChars) {
      nextBoundary = charEntries[idx + 1].start;
    } else {
      // Find following object (e.g. Stock record or array)
      if (isSavedChars) {
        // Stock record is at ~84001
        nextBoundary = findBytePattern(bytes, [0x05, 0xef, 0x00, 0x00, 0x00, 0x05, 0x53, 0x74, 0x6f, 0x63, 0x6b], start);
        if (nextBoundary === -1) nextBoundary = start + 313;
      } else {
        // End of timeChars block
        nextBoundary = findBytePattern(bytes, [0x05, 0x53, 0x74, 0x6f, 0x63, 0x6b], start);
        if (nextBoundary === -1) nextBoundary = start + 313;
      }
    }

    // Read Name & Alias
    let p = isC1Saved ? start + 8 : start + 17;
    const nameRes = readStringRecord(p);
    const name = nameRes.str;
    p += nameRes.bytesRead;

    const aliasRes = readStringRecord(p);
    const alias = aliasRes.str;
    p += aliasRes.bytesRead;

    // Followed by voice (float), role (int32), demeanour (float), team (int32)
    const voice = view.getFloat32(p, true);
    const roleOffset = p + 4;
    const role = view.getInt32(roleOffset, true);
    const demeanour = view.getFloat32(p + 8, true);
    const teamOffset = p + 12;
    const team = view.getInt32(teamOffset, true);

    // Find vitals by scanning for 4 consecutive MemberReferences (\x09 <4B> * 4 = 20B) between start and start+250
    let healthOffset = -1;
    for (let k = start + 20; k < Math.min(start + 260, nextBoundary - 40); k++) {
      if (
        bytes[k] === 0x09 &&
        bytes[k + 5] === 0x09 &&
        bytes[k + 10] === 0x09 &&
        bytes[k + 15] === 0x09
      ) {
        healthOffset = k + 20;
        break;
      }
    }

    let health = 100;
    let healthLimit = 100;
    let spirit = 100;
    let injury = 0;
    let dead = 0;
    const vitalsOffsets = {};

    if (healthOffset !== -1) {
      health = view.getFloat32(healthOffset, true);
      healthLimit = view.getFloat32(healthOffset + 4, true);
      spirit = view.getFloat32(healthOffset + 8, true);
      injury = view.getInt32(healthOffset + 12, true);
      dead = view.getInt32(healthOffset + 16, true);

      vitalsOffsets.health = healthOffset;
      vitalsOffsets.healthLimit = healthOffset + 4;
      vitalsOffsets.spirit = healthOffset + 8;
      vitalsOffsets.injury = healthOffset + 12;
      vitalsOffsets.dead = healthOffset + 16;
    }

    // Read powers from the tail of the character block relative to nextBoundary
    const transformOffset = nextBoundary - 41;
    const powerAttackOffset = nextBoundary - 37;
    const powerGrappleOffset = nextBoundary - 33;
    const powerManipulateOffset = nextBoundary - 29;
    const limbObjIdOffset = nextBoundary - 24;
    const powerFlightOffset = nextBoundary - 20;
    const powerCraftOffset = nextBoundary - 16;
    const powerInnateOffset = nextBoundary - 12;
    const weaknessOffset = nextBoundary - 8;

    const transform = view.getInt32(transformOffset, true);
    const powerAttack = view.getInt32(powerAttackOffset, true);
    const powerGrapple = view.getInt32(powerGrappleOffset, true);
    const powerManipulate = view.getInt32(powerManipulateOffset, true);
    const limbObjId = view.getUint32(limbObjIdOffset, true);
    const powerFlight = view.getInt32(powerFlightOffset, true);
    const powerCraft = view.getInt32(powerCraftOffset, true);
    const powerInnate = view.getInt32(powerInnateOffset, true);
    const weakness = view.getInt32(weaknessOffset, true);

    const limbInfo = limbArrays.get(limbObjId);
    const projectileLimb = limbInfo ? { ...limbInfo.slots } : { "0": 0, "1": 0, "2": 0 };

    const charObj = {
      id: cid,
      player,
      name,
      alias,
      voice,
      role,
      demeanour,
      team,
      health,
      healthLimit,
      spirit,
      injury,
      dead,
      transform,
      powerAttack,
      powerGrapple,
      powerManipulate,
      projectileLimb,
      powerFlight,
      powerCraft,
      powerInnate,
      weakness,
      superStat: { "0": 100, "1": 100, "2": 100, "3": 100, "4": 100, "5": 100, "6": 100 },
      stat: { "0": 100, "1": 100, "2": 100, "3": 100, "4": 100, "5": 100, "6": 100, "7": 100, "8": 100 },
    };

    targetRoster[String(cid)] = charObj;
    targetOffsets[String(cid)] = {
      role: roleOffset,
      team: teamOffset,
      ...vitalsOffsets,
      transform: transformOffset,
      powerAttack: powerAttackOffset,
      powerGrapple: powerGrappleOffset,
      powerManipulate: powerManipulateOffset,
      powerFlight: powerFlightOffset,
      powerCraft: powerCraftOffset,
      powerInnate: powerInnateOffset,
      weakness: weaknessOffset,
      limbOffsets: limbInfo ? limbInfo.offsets : null,
    };
  }

  return {
    saveData: {
      savedChars,
      timeChars,
    },
    offsets,
    rawBuffer: buffer,
  };
}

/**
 * In-place binary patcher: writes modified character powers and vitals
 * into a clone of the original Save.bytes ArrayBuffer.
 *
 * @param {ArrayBuffer} rawBuffer - Original bytes file buffer
 * @param {Object} offsets - Offsets map from parseSaveBytes
 * @param {Object} currentSaveData - The modified saveData in state
 * @returns {Uint8Array} - The modified, byte-for-byte ready binary file
 */
export function patchSaveBytes(rawBuffer, offsets, currentSaveData) {
  // Clone buffer so original remains untouched
  const outputBytes = new Uint8Array(rawBuffer.slice(0));
  const view = new DataView(outputBytes.buffer);

  for (const rosterKey of ["savedChars", "timeChars"]) {
    const rosterData = currentSaveData[rosterKey];
    const rosterOffsets = offsets[rosterKey];
    if (!rosterData || !rosterOffsets) continue;

    for (const [cid, charData] of Object.entries(rosterData)) {
      const charOffsets = rosterOffsets[cid];
      if (!charOffsets) continue;

      // Patch Powers (int32)
      if (charOffsets.transform !== undefined && charData.transform !== undefined) {
        view.setInt32(charOffsets.transform, Number(charData.transform), true);
      }
      if (charOffsets.powerAttack !== undefined && charData.powerAttack !== undefined) {
        view.setInt32(charOffsets.powerAttack, Number(charData.powerAttack), true);
      }
      if (charOffsets.powerGrapple !== undefined && charData.powerGrapple !== undefined) {
        view.setInt32(charOffsets.powerGrapple, Number(charData.powerGrapple), true);
      }
      if (charOffsets.powerManipulate !== undefined && charData.powerManipulate !== undefined) {
        view.setInt32(charOffsets.powerManipulate, Number(charData.powerManipulate), true);
      }
      if (charOffsets.powerFlight !== undefined && charData.powerFlight !== undefined) {
        view.setInt32(charOffsets.powerFlight, Number(charData.powerFlight), true);
      }
      if (charOffsets.powerCraft !== undefined && charData.powerCraft !== undefined) {
        view.setInt32(charOffsets.powerCraft, Number(charData.powerCraft), true);
      }
      if (charOffsets.powerInnate !== undefined && charData.powerInnate !== undefined) {
        view.setInt32(charOffsets.powerInnate, Number(charData.powerInnate), true);
      }
      if (charOffsets.weakness !== undefined && charData.weakness !== undefined) {
        view.setInt32(charOffsets.weakness, Number(charData.weakness), true);
      }

      // Patch Projectile Limb (all 3 slots)
      if (charOffsets.limbOffsets && charData.projectileLimb) {
        const slots = charData.projectileLimb;
        const s0 = typeof slots === "object" ? Number(slots["0"] ?? 0) : Number(slots);
        const s1 = typeof slots === "object" ? Number(slots["1"] ?? 0) : Number(slots);
        const s2 = typeof slots === "object" ? Number(slots["2"] ?? 0) : Number(slots);
        view.setInt32(charOffsets.limbOffsets[0], s0, true);
        view.setInt32(charOffsets.limbOffsets[1], s1, true);
        view.setInt32(charOffsets.limbOffsets[2], s2, true);
      }

      // Patch Vitals
      if (charOffsets.health !== undefined && charData.health !== undefined) {
        view.setFloat32(charOffsets.health, Number(charData.health), true);
      }
      if (charOffsets.healthLimit !== undefined && charData.healthLimit !== undefined) {
        view.setFloat32(charOffsets.healthLimit, Number(charData.healthLimit), true);
      }
      if (charOffsets.spirit !== undefined && charData.spirit !== undefined) {
        view.setFloat32(charOffsets.spirit, Number(charData.spirit), true);
      }
      if (charOffsets.injury !== undefined && charData.injury !== undefined) {
        view.setInt32(charOffsets.injury, Number(charData.injury), true);
      }
      if (charOffsets.dead !== undefined && charData.dead !== undefined) {
        view.setInt32(charOffsets.dead, Number(charData.dead), true);
      }

      // Patch Role & Team
      if (charOffsets.role !== undefined && charData.role !== undefined) {
        view.setInt32(charOffsets.role, Number(charData.role), true);
      }
      if (charOffsets.team !== undefined && charData.team !== undefined) {
        view.setInt32(charOffsets.team, Number(charData.team), true);
      }
    }
  }

  return outputBytes;
}

/**
 * Helper to find byte pattern sequence in Uint8Array
 */
function findBytePattern(bytes, pattern, startIndex = 0) {
  const pLen = pattern.length;
  const maxIdx = bytes.length - pLen;
  for (let i = startIndex; i <= maxIdx; i++) {
    let match = true;
    for (let j = 0; j < pLen; j++) {
      if (bytes[i + j] !== pattern[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
}
