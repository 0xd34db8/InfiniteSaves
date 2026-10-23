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

  // 1. Index all 3-int limb arrays and float stat/superStat arrays (RecordType 15 = ArraySinglePrimitive)
  // Structure: 0x0f <obj_id: 4B uint32> <length: 4B uint32> <prim_type: 1B uint8> <payload...>
  const limbArrays = new Map();
  const statArrays = new Map();
  for (let i = 0; i <= totalLen - 10; i++) {
    if (bytes[i] === 0x0f) {
      const objId = view.getUint32(i + 1, true);
      const len = view.getUint32(i + 5, true);
      const primType = bytes[i + 9];
      if (len === 3 && primType === 8 && i + 22 <= totalLen) {
        const offset0 = i + 10;
        const s0 = view.getInt32(offset0, true);
        const s1 = view.getInt32(offset0 + 4, true);
        const s2 = view.getInt32(offset0 + 8, true);
        limbArrays.set(objId, {
          offsets: [offset0, offset0 + 4, offset0 + 8],
          slots: { "0": s0, "1": s1, "2": s2 },
        });
        i += 21; // skip array payload
      } else if (primType === 11 && len >= 1 && len <= 20 && i + 10 + len * 4 <= totalLen) {
        const offsets = [];
        const values = {};
        const offset0 = i + 10;
        for (let s = 0; s < len; s++) {
          offsets.push(offset0 + s * 4);
          values[String(s)] = view.getFloat32(offset0 + s * 4, true);
        }
        statArrays.set(objId, {
          len,
          offsets,
          values,
        });
        i += 9 + len * 4;
      }
    }
  }

  // 1b. Index all Costume records (Civilian = Costume 1, Super = Costume 2)
  // The MDickie game engine computes 3D bone scales and body morphs directly from Costume
  let costumeMetaId = -1;
  let firstCostumeOffset = -1;

  for (let i = 0; i < totalLen - 20; i++) {
    if (bytes[i] === 0x05) {
      const objId = view.getInt32(i + 1, true);
      const p = i + 5;
      const strLen = bytes[p];
      if (strLen === 7) {
        const str = new TextDecoder("utf-8").decode(bytes.subarray(p + 1, p + 8));
        if (str === "Costume") {
          costumeMetaId = objId;
          for (let k = p + 8; k < p + 300 && k + 4 <= totalLen; k++) {
            if (bytes[k] === 0x02 && bytes[k + 1] === 0x00 && bytes[k + 2] === 0x00 && bytes[k + 3] === 0x00) {
              firstCostumeOffset = k + 4;
              break;
            }
          }
          break;
        }
      }
    }
  }

  const savedCostumes = new Map();
  const timeCostumes = new Map();

  if (costumeMetaId !== -1 && firstCostumeOffset !== -1) {
    const rawCostumes = [];
    rawCostumes.push({
      id: view.getInt32(firstCostumeOffset, true),
      charID: view.getInt32(firstCostumeOffset + 4, true),
      dataOffset: firstCostumeOffset,
    });

    for (let i = firstCostumeOffset + 70; i < totalLen - 20; i++) {
      if (bytes[i] === 0x01 && view.getInt32(i + 5, true) === costumeMetaId) {
        rawCostumes.push({
          id: view.getInt32(i + 9, true),
          charID: view.getInt32(i + 13, true),
          dataOffset: i + 9,
        });
      }
    }

    const half = Math.floor(rawCostumes.length / 2);
    for (let i = 0; i < half; i++) {
      const c = rawCostumes[i];
      if (!savedCostumes.has(c.charID)) savedCostumes.set(c.charID, []);
      savedCostumes.get(c.charID).push(c);
    }
    for (let i = half; i < rawCostumes.length; i++) {
      const c = rawCostumes[i];
      if (!timeCostumes.has(c.charID)) timeCostumes.set(c.charID, []);
      timeCostumes.get(c.charID).push(c);
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

    // Find body/physicality fields (gender, height, age, headSize, bodyMass, muscleMass, armMass, legMass)
    let gender = 0;
    let height = 1.0;
    let age = 30;
    let headSize = 1.0;
    let bodyMass = 0;
    let muscleMass = 50;
    let armMass = 0;
    let legMass = 0;
    const bodyOffsets = {};

    for (let k = p + 16; k < Math.min(start + 160, nextBoundary - 32); k++) {
      const g = view.getInt32(k, true);
      const h = view.getFloat32(k + 4, true);
      const a = view.getInt32(k + 8, true);
      const hs = view.getFloat32(k + 12, true);

      if ((g === 0 || g === 1) && h >= 0.15 && h <= 2.5 && a >= 1 && a <= 120 && hs >= 0.7 && hs <= 2.0) {
        gender = g;
        height = h;
        age = a;
        headSize = hs;
        bodyMass = view.getFloat32(k + 16, true);
        muscleMass = view.getFloat32(k + 20, true);
        armMass = view.getFloat32(k + 24, true);
        legMass = view.getFloat32(k + 28, true);

        bodyOffsets.gender = k;
        bodyOffsets.height = k + 4;
        bodyOffsets.age = k + 8;
        bodyOffsets.headSize = k + 12;
        bodyOffsets.bodyMass = k + 16;
        bodyOffsets.muscleMass = k + 20;
        bodyOffsets.armMass = k + 24;
        bodyOffsets.legMass = k + 28;
        break;
      }
    }

    // Find vitals & stats by scanning for 4 consecutive MemberReferences (\x09 <4B> * 4 = 20B) between start and start+250
    // The references are: [costume, scar, stat, superStat] followed immediately by health, healthLimit, spirit, injury, dead
    let healthOffset = -1;
    let statRef = -1;
    let superStatRef = -1;
    for (let k = start + 20; k < Math.min(start + 260, nextBoundary - 40); k++) {
      if (
        bytes[k] === 0x09 &&
        bytes[k + 5] === 0x09 &&
        bytes[k + 10] === 0x09 &&
        bytes[k + 15] === 0x09
      ) {
        statRef = view.getUint32(k + 11, true);
        superStatRef = view.getUint32(k + 16, true);
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

    const statInfo = statArrays.get(statRef);
    const superStatInfo = statArrays.get(superStatRef);

    const stat = statInfo
      ? { ...statInfo.values }
      : { "0": 100, "1": 100, "2": 100, "3": 100, "4": 100, "5": 100, "6": 100, "7": 100, "8": 100 };

    const superStat = superStatInfo
      ? { ...superStatInfo.values }
      : { "0": 100, "1": 100, "2": 100, "3": 100, "4": 100, "5": 100, "6": 100 };

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
      gender,
      height,
      age,
      headSize,
      bodyMass,
      muscleMass,
      armMass,
      legMass,
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
      superStat,
      stat,
    };

    const costumeList = (isSavedChars ? savedCostumes : timeCostumes).get(cid) || [];
    const costumeOffsets = costumeList.map((c) => ({
      costumeId: c.id,
      gender: c.dataOffset + 42,
      age: c.dataOffset + 46,
      height: c.dataOffset + 50,
      headSize: c.dataOffset + 54,
      bodyMass: c.dataOffset + 58,
      muscleMass: c.dataOffset + 62,
      armMass: c.dataOffset + 66,
    }));

    targetRoster[String(cid)] = charObj;
    targetOffsets[String(cid)] = {
      voice: p,
      role: roleOffset,
      team: teamOffset,
      ...bodyOffsets,
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
      statOffsets: statInfo ? statInfo.offsets : null,
      superStatOffsets: superStatInfo ? superStatInfo.offsets : null,
      costumeOffsets: costumeOffsets.length > 0 ? costumeOffsets : null,
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

      // Patch Body & Physicality
      if (charOffsets.gender !== undefined && charData.gender !== undefined) {
        view.setInt32(charOffsets.gender, Number(charData.gender), true);
      }
      if (charOffsets.height !== undefined && charData.height !== undefined) {
        view.setFloat32(charOffsets.height, Number(charData.height), true);
      }
      if (charOffsets.age !== undefined && charData.age !== undefined) {
        view.setInt32(charOffsets.age, Number(charData.age), true);
      }
      if (charOffsets.headSize !== undefined && charData.headSize !== undefined) {
        view.setFloat32(charOffsets.headSize, Number(charData.headSize), true);
      }
      if (charOffsets.bodyMass !== undefined && charData.bodyMass !== undefined) {
        view.setFloat32(charOffsets.bodyMass, Number(charData.bodyMass), true);
      }
      if (charOffsets.muscleMass !== undefined && charData.muscleMass !== undefined) {
        view.setFloat32(charOffsets.muscleMass, Number(charData.muscleMass), true);
      }
      if (charOffsets.armMass !== undefined && charData.armMass !== undefined) {
        view.setFloat32(charOffsets.armMass, Number(charData.armMass), true);
      }
      if (charOffsets.legMass !== undefined && charData.legMass !== undefined) {
        view.setFloat32(charOffsets.legMass, Number(charData.legMass), true);
      }
      if (charOffsets.voice !== undefined && charData.voice !== undefined) {
        view.setFloat32(charOffsets.voice, Number(charData.voice), true);
      }

      // Patch Physicality on all linked Costume records (Civilian & Super Alter-Ego)
      // The MDickie game engine computes 3D bone scales and body morphs directly from Costume
      if (charOffsets.costumeOffsets && Array.isArray(charOffsets.costumeOffsets)) {
        for (const cOffset of charOffsets.costumeOffsets) {
          if (cOffset.gender !== undefined && charData.gender !== undefined) {
            view.setInt32(cOffset.gender, Number(charData.gender), true);
          }
          if (cOffset.age !== undefined && charData.age !== undefined) {
            view.setInt32(cOffset.age, Number(charData.age), true);
          }
          if (cOffset.height !== undefined && charData.height !== undefined) {
            view.setFloat32(cOffset.height, Number(charData.height), true);
          }
          if (cOffset.headSize !== undefined && charData.headSize !== undefined) {
            view.setFloat32(cOffset.headSize, Number(charData.headSize), true);
          }
          if (cOffset.bodyMass !== undefined && charData.bodyMass !== undefined) {
            view.setFloat32(cOffset.bodyMass, Number(charData.bodyMass), true);
          }
          if (cOffset.muscleMass !== undefined && charData.muscleMass !== undefined) {
            view.setFloat32(cOffset.muscleMass, Number(charData.muscleMass), true);
          }
          if (cOffset.armMass !== undefined && charData.armMass !== undefined) {
            view.setFloat32(cOffset.armMass, Number(charData.armMass), true);
          }
        }
      }

      // Patch Power Amounts / Stats (float32 array)
      if (charOffsets.statOffsets && charData.stat) {
        for (let s = 0; s < charOffsets.statOffsets.length; s++) {
          const val = charData.stat[String(s)] ?? charData.stat[s];
          if (val !== undefined && !isNaN(val)) {
            view.setFloat32(charOffsets.statOffsets[s], Number(val), true);
          }
        }
      }

      // Patch Power Amounts / SuperStats (float32 array)
      if (charOffsets.superStatOffsets && charData.superStat) {
        for (let s = 0; s < charOffsets.superStatOffsets.length; s++) {
          const val = charData.superStat[String(s)] ?? charData.superStat[s];
          if (val !== undefined && !isNaN(val)) {
            view.setFloat32(charOffsets.superStatOffsets[s], Number(val), true);
          }
        }
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
