
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = 'brazilianSyncopationLab.fragmentQualityOverrides.v1';
  const SAVED_STUDIES_KEY = 'brazilianSyncopationLab.savedStudies.v1';
  const state = {
    fragments: [], sequence: [], generatedXml: null, osmd: null, events: [], savedStudies: [], currentStudyMeta: null,
    synthClick: null, synthAccent: null, synthTamborim: null, synthRimshot: null, synthWoodblock: null, synthClave: null, synthClap: null, synthMetronome: null,
    audioTracks: [], audioEl: new Audio(), currentAudioUrl: null, backingPlayer: null, currentPlayerTrackId: null, isPlaying: false, isStarting: false, backingLoopHandler: null
  };
  state.audioEl.loop = true;



  function escapeXml(s) { return String(s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c])); }
  function parseXml(text) { return new DOMParser().parseFromString(text, 'application/xml'); }
  function serialize(node) { return new XMLSerializer().serializeToString(node); }
  function getText(node, selector, fallback='') { const el = node.querySelector(selector); return el ? el.textContent.trim() : fallback; }
  function getFirstMeasure(doc) { return doc.querySelector('part measure'); }
  function getDivisionsFromDoc(doc) { const n = Number(getText(doc, 'attributes divisions', '1')); return Number.isFinite(n) && n > 0 ? n : 1; }

  function cloneRelevantMusicNodes(fragmentDoc) {
    const firstMeasure = getFirstMeasure(fragmentDoc);
    if (!firstMeasure) return [];
    const allowed = ['note', 'backup', 'forward', 'direction'];
    return Array.from(firstMeasure.childNodes).filter(n => n.nodeType === 1 && allowed.includes(n.nodeName)).map(n => n.cloneNode(true));
  }

  function extractAttributesFromFirstDoc(doc) {
    const attr = doc.querySelector('part measure attributes');
    if (attr) return attr.cloneNode(true);
    const parser = new DOMParser();
    return parser.parseFromString('<attributes><divisions>1</divisions><key><fifths>0</fifths></key><time><beats>2</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes>', 'application/xml').documentElement;
  }

  function forceTimeSignature(attributesNode, beats, beatType = 4) {
    const cloned = attributesNode.cloneNode(true);
    Array.from(cloned.querySelectorAll('time')).forEach(n => n.remove());
    const doc = cloned.ownerDocument;
    const time = doc.createElement('time');
    const beatsEl = doc.createElement('beats'); beatsEl.textContent = String(beats);
    const beatTypeEl = doc.createElement('beat-type'); beatTypeEl.textContent = String(beatType);
    time.appendChild(beatsEl); time.appendChild(beatTypeEl);
    const clef = cloned.querySelector('clef');
    if (clef) cloned.insertBefore(time, clef); else cloned.appendChild(time);
    return cloned;
  }

  function inferQualityFromId(id) {
    const upper = String(id || "").toUpperCase();
    if (/(^|[^A-Z])A([^A-Z]|$)/.test(upper) || /_A$/.test(upper) || /-A$/.test(upper) || /A\d*$/.test(upper)) return "A";
    if (/(^|[^A-Z])B([^A-Z]|$)/.test(upper) || /_B$/.test(upper) || /-B$/.test(upper) || /B\d*$/.test(upper)) return "B";
    return "A";
  }

  function qualityClass(fragmentOrQuality) {
    const q = typeof fragmentOrQuality === "string" ? fragmentOrQuality : fragmentOrQuality?.quality;
    return q === "B" ? "quality-b" : "quality-a";
  }

  function normalizeFragment(fileName, text, quality = null) {
    const doc = parseXml(text);
    if (doc.querySelector('parsererror')) throw new Error(`${fileName}: MusicXML non leggibile.`);
    const id = fileName.replace(/\.(musicxml|xml)$/i, '');
    const title = getText(doc, 'work-title', id) || id;
    return { id, title, fileName, text, doc, nodes: cloneRelevantMusicNodes(doc), divisions: getDivisionsFromDoc(doc), quality: quality || inferQualityFromId(id) };
  }

  function saveQualityOverrides() {
    try {
      const overrides = {};
      state.fragments.forEach(f => { overrides[f.id] = f.quality; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
      return true;
    } catch (err) { console.warn(err); return false; }
  }

  function getQualityOverrides() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (err) { console.warn(err); return {}; }
  }

  async function loadFragmentLibrary() {
    const overrides = getQualityOverrides();
    const loaded = [];
    for (const fileName of FRAGMENT_FILES) {
      try {
        const res = await fetch(`assets/fragments/${fileName}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const id = fileName.replace(/\.(musicxml|xml)$/i, '');
        loaded.push(normalizeFragment(fileName, text, overrides[id] || null));
      } catch (err) { console.warn(`Could not load fragment ${fileName}:`, err); }
    }
    state.fragments = loaded.sort(compareIds);
    renderLibrary(); updateGenerateState(); buildManualGridIfNeeded();
    setStatus('loadStatus', state.fragments.length ? `${state.fragments.length} fragments loaded from assets/fragments/.` : 'No fragments found in assets/fragments/.', !state.fragments.length);
  }

  function setStatus(id, text, error=false) { $(id).textContent = text; $(id).className = error ? 'status error' : 'status'; }
  function compareIds(a,b) { return a.id.localeCompare(b.id, undefined, { numeric:true }); }


  function updateFragmentQuality(id, quality) {
    const frag = state.fragments.find(f => f.id === id);
    if (!frag) return;
    frag.quality = quality === 'B' ? 'B' : 'A';
    saveQualityOverrides();
    renderLibrary();
    buildManualGridIfNeeded();
    if (state.sequence.length) renderSequence();
    setStatus('loadStatus', `Fragment ${id} updated to type ${frag.quality}.`, false);
  }

  function fragmentAliases(id) {
    const raw = String(id || '').trim();
    const noExt = raw.replace(/\.(musicxml|xml)$/i, '');
    const upper = noExt.toUpperCase();
    const noLeadingZero = upper.replace(/^([AB])0+/, '$1').replace(/^0+/, '');
    const withLeadingZero = upper.replace(/^([AB])(\d)$/, '$10$2');
    return new Set([raw, noExt, upper, noLeadingZero, withLeadingZero]);
  }

  function findFragmentByPatternId(patternId) {
    const targetAliases = fragmentAliases(patternId);
    return state.fragments.find(f => {
      const aliases = fragmentAliases(f.id);
      for (const alias of aliases) if (targetAliases.has(alias)) return true;
      return false;
    });
  }

  function resolvePatternFragments(pattern) {
    return pattern.fragments.map(id => findFragmentByPatternId(id)).filter(Boolean);
  }

  function buildRepeatedSequence(baseSeq, total) {
    if (!baseSeq.length) return [];
    const result = [];
    for (let i = 0; i < total; i++) result.push(baseSeq[i % baseSeq.length]);
    return result;
  }

  function renderLibrary() {
    const box = $('library');
    if (!state.fragments.length) { box.innerHTML = '<div class="cell-item"><span>No files</span></div>'; return; }
    box.innerHTML = state.fragments.map(f => `
      <div class="cell-item has-quality ${qualityClass(f)}" data-frag-id="${escapeXml(f.id)}">
        <div class="cell-main">
          <span><strong>${escapeXml(f.id)}</strong> <span class="quality-chip ${qualityClass(f)}">${escapeXml(f.quality || 'A')}</span></span>
          <small>${escapeXml(f.fileName)}</small>
        </div>
        <div class="cell-actions">
          <label class="small" style="margin:0; font-weight:700;">Type</label>
          <select class="quality-select ${qualityClass(f)}" data-quality-id="${escapeXml(f.id)}">
            <option value="A" ${f.quality === 'A' ? 'selected' : ''}>A</option>
            <option value="B" ${f.quality === 'B' ? 'selected' : ''}>B</option>
          </select>
        </div>
      </div>`).join('');
    Array.from(box.querySelectorAll('[data-quality-id]')).forEach(sel => {
      sel.addEventListener('change', (e) => updateFragmentQuality(e.target.getAttribute('data-quality-id'), e.target.value));
    });
  }

  function pickRandomSequence(total, mode) {
    const source = state.fragments, result = []; let bag = [...source];
    for (let i=0; i<total; i++) {
      let candidates = source;
      if (mode === 'avoidAdjacent' && result.length) { const filtered = source.filter(f => f.id !== result[result.length-1].id); candidates = filtered.length ? filtered : source; }
      if (mode === 'noRepeat') { if (!bag.length) bag = [...source]; candidates = bag; }
      const choice = candidates[Math.floor(Math.random()*candidates.length)];
      result.push(choice);
      if (mode === 'noRepeat') bag = bag.filter(f => f.id !== choice.id);
    }
    return result;
  }


  const FRAGS_PER_BAR = 2;
  function getBars() { const allowed = [2,4,8,16,32]; const n = Number($('barsInput').value || 4); return allowed.includes(n) ? n : 4; }
  function getTotalFragments() { return getBars() * FRAGS_PER_BAR; }

  function getPatternById(id) {
    return traditionalPatterns.find(p => p.id === id) || traditionalPatterns[0];
  }

  function populatePatternSelects() {
    const options = traditionalPatterns.map(p => `<option value="${escapeXml(p.id)}">${escapeXml(p.name)} — ${escapeXml(p.style)}</option>`).join('');
    if ($('traditionalPatternSelect')) $('traditionalPatternSelect').innerHTML = options;
    if ($('hybridPatternSelect')) $('hybridPatternSelect').innerHTML = options;

    const box = $('progressionSelectors');
    if (box) {
      let html = '';
      for (let i = 0; i < 8; i++) {
        html += `<div class="pattern-row"><span>${i+1}</span><select class="progressionSelect" data-index="${i}">
          <option value="">— None —</option>${options}
        </select></div>`;
      }
      box.innerHTML = html;
      Array.from(box.querySelectorAll('select')).forEach((sel, i) => {
        if (i < Math.min(4, traditionalPatterns.length)) sel.value = traditionalPatterns[i].id;
      });
    }
    updateTraditionalPatternInfo();
    updateHybridModeUI();
  }

  function updateTraditionalPatternInfo() {
    const select = $('traditionalPatternSelect');
    const info = $('traditionalPatternInfo');
    if (!select || !info || !traditionalPatterns.length) return;
    const p = getPatternById(select.value);
    info.textContent = `${p.style}: ${p.fragments.join(' ')} — ${p.description || ''}`;
  }

  function updateProgressionModeUI() {
    const isRandom = $('progressionModeSelect') && $('progressionModeSelect').value === 'random';
    if ($('progressionManualBox')) $('progressionManualBox').style.display = isRandom ? 'none' : 'block';
    if ($('progressionRandomBox')) $('progressionRandomBox').style.display = isRandom ? 'block' : 'none';
  }

  function updateModePanels() {
    const mode = $('modeSelect').value;
    if ($('randomOptions')) $('randomOptions').style.display = mode === 'random' ? 'block' : 'none';
    if ($('manualOptions')) $('manualOptions').style.display = mode === 'manual' ? 'block' : 'none';
    if ($('traditionalBox')) $('traditionalBox').classList.toggle('active', mode === 'traditional');
    if ($('progressionBox')) $('progressionBox').classList.toggle('active', mode === 'progression');
    if ($('hybridBox')) $('hybridBox').classList.toggle('active', mode === 'hybrid');
    updateProgressionModeUI();
    updateHybridModeUI();
  }

  function pickRandomPatternSequence(totalFragments, pool = traditionalPatterns) {
    const chosen = [];
    let seq = [];
    let guard = 0;
    while (seq.length < totalFragments && guard < 100) {
      const pattern = pool[Math.floor(Math.random() * pool.length)];
      chosen.push(pattern);
      seq = seq.concat(resolvePatternFragments(pattern));
      guard++;
    }
    return { sequence: seq.slice(0, totalFragments), patterns: chosen };
  }

  function updateHybridModeUI() {
    const form = $('hybridFormSelect') ? $('hybridFormSelect').value : '';
    const isGrammarRemix = form === 'grammarRemix';

    if ($('hybridPatternSourceBox')) $('hybridPatternSourceBox').style.display = isGrammarRemix ? 'none' : 'block';
    if ($('hybridVariationTypeBox')) $('hybridVariationTypeBox').style.display = isGrammarRemix ? 'none' : 'block';
    if ($('hybridGrammarHint')) $('hybridGrammarHint').style.display = isGrammarRemix ? 'block' : 'none';

    const source = $('hybridPatternSourceSelect') ? $('hybridPatternSourceSelect').value : 'randomPatterns';
    if ($('hybridChosenPatternBox')) $('hybridChosenPatternBox').style.display = (!isGrammarRemix && source === 'chosenPattern') ? 'block' : 'none';
  }

  function hasAllPatternFragments(pattern) {
    return pattern.fragments.every(id => !!findFragmentByPatternId(id));
  }

  function getAvailableTraditionalPatterns() {
    return traditionalPatterns.filter(hasAllPatternFragments);
  }

  function pickRandomFragmentWithQuality(quality, avoidId = null) {
    let pool = state.fragments.filter(f => f.quality === quality);
    if (!pool.length) pool = state.fragments.slice();
    if (avoidId && pool.length > 1) pool = pool.filter(f => f.id !== avoidId);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function buildRandomFragmentBlock(blockFragments) {
    return pickRandomSequence(blockFragments, $('repeatSelect') ? $('repeatSelect').value : 'avoidAdjacent');
  }

  function buildRandomLikeTemplate(templateSeq, variationType = null) {
    const type = variationType || (($('hybridRandomTypeSelect') && $('hybridRandomTypeSelect').value === 'matchColor') ? 'matchColor' : 'free');
    if (type !== 'matchColor') return buildRandomFragmentBlock(templateSeq.length);
    return templateSeq.map(t => pickRandomFragmentWithQuality(t.quality, t.id));
  }

  function chooseHybridPattern(available, forceRandom = false) {
    if (!available.length) return null;
    if (!forceRandom && $('hybridPatternSourceSelect') && $('hybridPatternSourceSelect').value === 'chosenPattern') {
      const selected = getPatternById($('hybridPatternSelect').value);
      return selected && hasAllPatternFragments(selected) ? selected : null;
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  function buildPatternBlock(pattern, blockFragments) {
    const patternSeq = resolvePatternFragments(pattern);
    return buildRepeatedSequence(patternSeq, blockFragments);
  }

  function buildHalfPatternHalfRandom(pattern, form, variationType = null) {
    const patternBlock = buildPatternBlock(pattern, FRAGS_PER_BAR * 2); // 2 bars
    const firstBar = patternBlock.slice(0, FRAGS_PER_BAR);
    const secondBar = patternBlock.slice(FRAGS_PER_BAR, FRAGS_PER_BAR * 2);

    if (form === 'patternOpeningRandomEnding') {
      return firstBar.concat(buildRandomLikeTemplate(secondBar, variationType));
    }

    if (form === 'randomOpeningPatternEnding') {
      return buildRandomLikeTemplate(firstBar, variationType).concat(secondBar);
    }

    return patternBlock;
  }

  function buildHybridSequence(totalFragments) {
    const blockFragments = FRAGS_PER_BAR * 2; // 2 bars = one phrase block
    const available = getAvailableTraditionalPatterns();
    if (!available.length) {
      return { sequence: [], labels: [], error: 'No complete traditional pattern is available. Check fragment names.' };
    }

    const form = $('hybridFormSelect') ? $('hybridFormSelect').value : 'patternBlockRandomBlock';
    const blocks = Math.ceil(totalFragments / blockFragments);
    let sequence = [];
    const labels = [];

    for (let b = 0; b < blocks; b++) {
      if (form === 'grammarRemix') {
        const pattern = chooseHybridPattern(available, true);
        if (!pattern) return { sequence: [], labels: [], error: 'No complete traditional pattern is available for Grammar Remix.' };
        const grammarForm = Math.random() < 0.5 ? 'patternOpeningRandomEnding' : 'randomOpeningPatternEnding';
        const variationType = Math.random() < 0.5 ? 'free' : 'matchColor';
        sequence = sequence.concat(buildHalfPatternHalfRandom(pattern, grammarForm, variationType));
        const direction = grammarForm === 'patternOpeningRandomEnding' ? 'pattern→random' : 'random→pattern';
        const variation = variationType === 'matchColor' ? 'A/B' : 'free';
        labels.push(`Grammar Remix: ${pattern.name} ${direction} ${variation}`);
        continue;
      }

      if (form === 'patternOpeningRandomEnding' || form === 'randomOpeningPatternEnding') {
        const pattern = chooseHybridPattern(available);
        if (!pattern) return { sequence: [], labels: [], error: 'Chosen hybrid pattern is missing fragments.' };
        sequence = sequence.concat(buildHalfPatternHalfRandom(pattern, form));
        labels.push(form === 'patternOpeningRandomEnding' ? `${pattern.name} opening + random ending` : `Random opening + ${pattern.name} ending`);
        continue;
      }

      const usePattern = form === 'patternBlockRandomBlock' ? b % 2 === 0 : b % 2 === 1;

      if (usePattern) {
        const pattern = chooseHybridPattern(available);
        if (!pattern) return { sequence: [], labels: [], error: 'Chosen hybrid pattern is missing fragments.' };
        sequence = sequence.concat(buildPatternBlock(pattern, blockFragments));
        labels.push(pattern.name);
      } else {
        sequence = sequence.concat(buildRandomFragmentBlock(blockFragments));
        labels.push('Random');
      }
    }

    return { sequence: sequence.slice(0, totalFragments), labels, error: null };
  }


  function buildManualGridIfNeeded() {
    updateModePanels();
    if ($('modeSelect').value !== 'manual') return;
    buildManualGrid(false);
  }


  function buildManualGrid(reset=true) {
    const grid = $('manualGrid');
    const total = getTotalFragments();
    if (!state.fragments.length) { grid.innerHTML = '<div class="small">Load fragments first.</div>'; return; }
    const previous = reset ? [] : Array.from(grid.querySelectorAll('select')).map(s => s.value);
    const options = state.fragments.map(f => `<option value="${escapeXml(f.id)}">${escapeXml(f.id)}</option>`).join('');
    let html = '';
    for (let i=0; i<total; i++) {
      const val = previous[i] || state.fragments[i % state.fragments.length].id;
      const frag = state.fragments.find(f => f.id === val) || state.fragments[i % state.fragments.length];
      html += `<div class="manual-slot ${qualityClass(frag)}"><span>${i+1}</span><select class="manualSelect ${qualityClass(frag)}" data-index="${i}">${options}</select></div>`;
    }
    grid.innerHTML = html;
    Array.from(grid.querySelectorAll('select')).forEach((s,i) => {
      const currentId = previous[i] || state.fragments[i % state.fragments.length].id;
      s.value = currentId;
      applySelectQualityStyle(s, currentId);
      s.addEventListener('change', () => applySelectQualityStyle(s, s.value));
    });
  }

  function clearManualGrid() { Array.from(document.querySelectorAll('.manualSelect')).forEach((s,i) => { if (state.fragments[i % state.fragments.length]) { s.value = state.fragments[i % state.fragments.length].id; applySelectQualityStyle(s, s.value); } }); }

  function applySelectQualityStyle(selectEl, fragmentId) {
    const frag = state.fragments.find(f => f.id === fragmentId);
    const cls = qualityClass(frag);
    selectEl.classList.remove('quality-a','quality-b');
    selectEl.classList.add(cls);
    const slot = selectEl.closest('.manual-slot');
    if (slot) { slot.classList.remove('quality-a','quality-b'); slot.classList.add(cls); }
  }

  function getManualSequence() {
    const ids = Array.from(document.querySelectorAll('.manualSelect')).map(s => s.value);
    return ids.map(id => state.fragments.find(f => f.id === id)).filter(Boolean);
  }

  function getFragmentMusicColor(fragment) {
    if (fragment?.quality === 'REST') return '#777777';
    return fragment?.quality === 'B' ? '#d4a000' : '#2f8f46';
  }

  function tintNodeForFragment(node, fragment) {
    if (!node || node.nodeType !== 1) return node;
    if (fragment?.quality === 'REST') return node;
    if (node.nodeName === 'note') {
      const color = getFragmentMusicColor(fragment);
      node.setAttribute('color', color);
      const notehead = node.querySelector('notehead');
      if (notehead) notehead.setAttribute('color', color);
      const accidental = node.querySelector('accidental');
      if (accidental) accidental.setAttribute('color', color);
      const beamEls = node.querySelectorAll('beam, stem, type, dot, time-modification');
      beamEls.forEach(el => el.setAttribute('color', color));
    }
    return node;
  }

  function cloneFragmentForStudy(fragment, extra = {}) {
    return Object.assign({}, fragment, extra);
  }

  function sequenceToSaveEntries(sequence) {
    return sequence.map(f => ({
      id: f.quality === 'REST' ? 'Rest' : f.id,
      rest: f.quality === 'REST',
      pickup: !!f.isPickup
    }));
  }

  function restoreSequenceFromEntries(entries) {
    const reference = state.fragments[0];
    const restored = [];
    const missing = [];
    for (const item of entries || []) {
      if (item.rest) {
        restored.push(makeRestFragment(reference));
      } else {
        const frag = findFragmentByPatternId(item.id);
        if (!frag) {
          missing.push(item.id);
        } else {
          restored.push(cloneFragmentForStudy(frag, { isPickup: !!item.pickup }));
        }
      }
    }
    return { restored, missing };
  }

  function makeStudyName(meta) {
    const now = new Date();
    const stamp = now.toLocaleString();
    const mode = meta?.modeLabel || 'Study';
    const bars = meta?.bars ? `${meta.bars} bars` : 'study';
    return `${mode} — ${bars} — ${stamp}`;
  }

  function saveSavedStudiesToBrowser() {
    try {
      localStorage.setItem(SAVED_STUDIES_KEY, JSON.stringify(state.savedStudies));
      return true;
    } catch(e) {
      console.warn(e);
      return false;
    }
  }

  function restoreSavedStudiesFromBrowser() {
    try {
      const raw = localStorage.getItem(SAVED_STUDIES_KEY);
      state.savedStudies = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(state.savedStudies)) state.savedStudies = [];
    } catch(e) {
      console.warn(e);
      state.savedStudies = [];
    }
    renderSavedStudies();
  }

  function renderSavedStudies() {
    const select = $('savedStudySelect');
    if (!select) return;
    if (!state.savedStudies.length) {
      select.innerHTML = '<option value="">No saved study</option>';
      $('loadStudyBtn').disabled = true;
      $('deleteStudyBtn').disabled = true;
      setStatus('savedStudiesStatus', 'No saved study yet.', false);
      return;
    }
    select.innerHTML = state.savedStudies.map(s => `<option value="${escapeXml(s.id)}">${escapeXml(s.name)}</option>`).join('');
    $('loadStudyBtn').disabled = false;
    $('deleteStudyBtn').disabled = false;
    setStatus('savedStudiesStatus', `${state.savedStudies.length} saved study/studies.`, false);
  }

  function saveCurrentStudy() {
    if (!state.sequence.length || !state.generatedXml) {
      setStatus('savedStudiesStatus', 'Generate a study before saving.', true);
      return;
    }
    const meta = state.currentStudyMeta || {};
    const name = prompt('Name this study:', makeStudyName(meta));
    if (!name) return;
    const saved = {
      id: `study-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      createdAt: new Date().toISOString(),
      sequence: sequenceToSaveEntries(state.sequence),
      meta: {
        modeLabel: meta.modeLabel || 'Study',
        bars: meta.bars || getBars(),
        bpm: Number($('bpmInput').value || 100),
        backingId: $('backingSelect')?.value || '',
        sound: $('soundSelect')?.value || 'woodblock',
        phraseRests: !!$('phraseRestInput')?.checked,
        loop: !!$('loopInput')?.checked,
        hybrid: meta.modeLabel && meta.modeLabel.includes('Hybrid')
      }
    };
    state.savedStudies.unshift(saved);
    saveSavedStudiesToBrowser();
    renderSavedStudies();
    $('savedStudySelect').value = saved.id;
    setStatus('savedStudiesStatus', `Saved: ${name}`, false);
  }

  async function loadSavedStudy() {
    invalidatePlayback();
    const id = $('savedStudySelect')?.value;
    const saved = state.savedStudies.find(s => s.id === id);
    if (!saved) return;
    stopPlayback();
    const { restored, missing } = restoreSequenceFromEntries(saved.sequence);
    if (missing.length) {
      setStatus('savedStudiesStatus', `Cannot load. Missing fragments: ${missing.join(', ')}`, true);
      return;
    }
    state.sequence = restored;
    state.generatedXml = buildScoreFromFragments(restored, FRAGS_PER_BAR);
    state.events = parsePlaybackEventsFromGeneratedXml(state.generatedXml);
    state.currentStudyMeta = saved.meta || {};
    if (saved.meta) {
      if ($('bpmInput')) { $('bpmInput').value = saved.meta.bpm || 100; $('bpmValue').textContent = $('bpmInput').value; Tone.Transport.bpm.value = Number($('bpmInput').value); }
      if ($('soundSelect') && saved.meta.sound) $('soundSelect').value = saved.meta.sound;
      if ($('loopInput')) $('loopInput').checked = saved.meta.loop !== false;
      if ($('backingSelect') && saved.meta.backingId) $('backingSelect').value = saved.meta.backingId;
    }
    renderSequence();
    $('summary').textContent = `Loaded saved study — ${saved.name} — ${restored.length} 1/4 units. Sound events: ${state.events.length}.`;
    ['playBtn','stopBtn','printBtn','saveStudyBtn'].forEach(id => $(id).disabled = false);
    await renderXml(state.generatedXml);
    setStatus('savedStudiesStatus', `Loaded: ${saved.name}`, false);
  }

  function deleteSavedStudy() {
    const id = $('savedStudySelect')?.value;
    const saved = state.savedStudies.find(s => s.id === id);
    if (!saved) return;
    if (!confirm(`Delete saved study "${saved.name}"?`)) return;
    state.savedStudies = state.savedStudies.filter(s => s.id !== id);
    saveSavedStudiesToBrowser();
    renderSavedStudies();
  }

  function downloadTextFile(filename, textContent) {
    const blob = new Blob([textContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
  }

  function exportSavedStudies() {
    const data = {
      app: 'Brazilian Syncopation Lab',
      type: 'saved-studies',
      version: 1,
      exportedAt: new Date().toISOString(),
      studies: state.savedStudies
    };
    downloadTextFile('brazilian_syncopation_lab_saved_studies.json', JSON.stringify(data, null, 2));
    setStatus('savedStudiesStatus', `Exported ${state.savedStudies.length} saved study/studies.`, false);
  }

  function importSavedStudiesFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || '{}'));
        const studies = Array.isArray(data.studies) ? data.studies : (Array.isArray(data) ? data : []);
        const existingIds = new Set(state.savedStudies.map(s => s.id));
        const normalized = studies.map(s => Object.assign({}, s, { id: existingIds.has(s.id) ? `study-${Date.now()}-${Math.random().toString(16).slice(2)}` : (s.id || `study-${Date.now()}-${Math.random().toString(16).slice(2)}`) }));
        state.savedStudies = normalized.concat(state.savedStudies);
        saveSavedStudiesToBrowser();
        renderSavedStudies();
        setStatus('savedStudiesStatus', `Imported ${normalized.length} saved study/studies.`, false);
      } catch(e) {
        console.warn(e);
        setStatus('savedStudiesStatus', 'Import failed: invalid saved-studies file.', true);
      }
    };
    reader.readAsText(file);
  }

  function makeRestFragment(referenceFragment) {
    const ref = referenceFragment || state.fragments[0] || {};
    return {
      id: 'Rest',
      quality: 'REST',
      divisions: ref.divisions || 1,
      nodes: [],
      doc: ref.doc
    };
  }

  function expandSequenceWithPhraseRests(sequence, fragsPerBar, phraseBars = 2, pauseBars = 2) {
    if (!$('phraseRestInput') || !$('phraseRestInput').checked) return sequence;
    const phraseLen = phraseBars * fragsPerBar;
    const pauseLen = pauseBars * fragsPerBar;
    const reference = sequence[0] || state.fragments[0];
    const expanded = [];
    for (let i = 0; i < sequence.length; i += phraseLen) {
      expanded.push(...sequence.slice(i, i + phraseLen));
      for (let r = 0; r < pauseLen; r++) expanded.push(makeRestFragment(reference));
    }
    return expanded;
  }

  function buildScoreFromFragments(sequence, fragsPerBar) {
    if (!sequence.length) return null;
    const baseAttributes = extractAttributesFromFirstDoc(sequence[0].doc);
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
      <!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
      <score-partwise version="3.1"><work><work-title>Generated Rhythm Study</work-title></work><part-list><score-part id="P1"><part-name>Ritmo</part-name></score-part></part-list><part id="P1"></part></score-partwise>`, 'application/xml');
    const part = newDoc.querySelector('part');
    const totalBars = Math.ceil(sequence.length / fragsPerBar);
    for (let b=0; b<totalBars; b++) {
      const measure = newDoc.createElement('measure'); measure.setAttribute('number', String(b+1));
      if (b > 0 && b % 4 === 0) {
        const print = newDoc.createElement('print');
        print.setAttribute('new-system', 'yes');
        measure.appendChild(print);
      }
      if (b===0) measure.appendChild(newDoc.importNode(forceTimeSignature(baseAttributes, fragsPerBar, 4), true));
      const chunk = sequence.slice(b*fragsPerBar, (b+1)*fragsPerBar);
      for (const frag of chunk) {
        if (!frag.nodes.length) {
          const rest = parser.parseFromString(`<note><rest/><duration>${frag.divisions}</duration><voice>1</voice><type>quarter</type></note>`, 'application/xml').documentElement;
          measure.appendChild(tintNodeForFragment(newDoc.importNode(rest, true), frag));
        } else {
          frag.nodes.forEach(node => {
            const imported = newDoc.importNode(node, true);
            measure.appendChild(tintNodeForFragment(imported, frag));
          });
        }
      }
      part.appendChild(measure);
    }
    return serialize(newDoc);
  }

  function parsePlaybackEventsFromGeneratedXml(xmlText) {
    const doc = parseXml(xmlText);
    const divisions = getDivisionsFromDoc(doc);
    const events = []; let cursor = 0;
    Array.from(doc.querySelectorAll('part > measure')).forEach((m, measureIndex) => {
      let measureStart = true;
      Array.from(m.children).forEach(el => {
        if (el.nodeName !== 'note') return;
        const durText = getText(el, 'duration', ''); let q = durText ? Number(durText)/divisions : 1;
        if (!Number.isFinite(q) || q <= 0) q = 1;
        const isRest = !!el.querySelector('rest'); const isChord = !!el.querySelector('chord');
        if (!isRest && !isChord) { events.push({ timeQ: cursor, durationQ: q, accent: measureStart, measureIndex }); measureStart = false; }
        if (!isChord) cursor += q;
      });
    });
    return events;
  }

  async function renderXml(xmlText) {
    const container = $('osmd-container'); container.innerHTML = '';
    try {
      state.osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(container, { 
        autoResize:true, 
        backend:'svg', 
        drawTitle:true, 
        drawingParameters:'compacttight'
      });
      if (state.osmd.EngravingRules) {
        state.osmd.EngravingRules.RenderXMeasuresPerLineAkaSystem = 4;
        state.osmd.EngravingRules.SystemMaxMeasureDistance = 8;
        state.osmd.EngravingRules.SystemMinMeasureDistance = 2;
      }
      await state.osmd.load(xmlText);
      if (state.osmd.EngravingRules) {
        state.osmd.EngravingRules.RenderXMeasuresPerLineAkaSystem = 4;
      }
      state.osmd.render();
      setStatus('renderStatus','Notation generated successfully.',false);
    } catch (err) {
      console.error(err); container.innerHTML = `<div class="empty">Could not render the notation. The MusicXML structure may be incompatible.</div>`;
      setStatus('renderStatus', String(err.message || err), true);
    }
  }


  async function generate() {
    invalidatePlayback();
    if (!state.fragments.length) return;
    const bars = getBars();
    const fragsPerBar = FRAGS_PER_BAR;
    const total = bars * fragsPerBar;
    const mode = $('modeSelect').value;
    let sequence = [];
    let modeLabel = 'Random';

    if (mode === 'manual') {
      sequence = getManualSequence().slice(0,total);
      modeLabel = 'Manual';
      if (sequence.length < total) { setStatus('renderStatus','Manual sequence incomplete: prepare the slots and choose the fragments.', true); return; }
    } else if (mode === 'traditional') {
      const pattern = getPatternById($('traditionalPatternSelect').value);
      const missing = pattern.fragments.filter(id => !findFragmentByPatternId(id));
      if (missing.length) { setStatus('renderStatus', `Missing fragments for ${pattern.name}: ${missing.join(', ')}. Check file names.`, true); return; }
      sequence = buildRepeatedSequence(resolvePatternFragments(pattern), total);
      modeLabel = `Traditional Pattern: ${pattern.name}`;
    } else if (mode === 'progression') {
      const progressionMode = $('progressionModeSelect') ? $('progressionModeSelect').value : 'manual';
      if (progressionMode === 'random') {
        const availablePatterns = getAvailableTraditionalPatterns();
        if (!availablePatterns.length) {
          setStatus('renderStatus', 'No complete traditional pattern is available. Check fragment names.', true);
          return;
        }
        const result = pickRandomPatternSequence(total, availablePatterns);
        sequence = result.sequence;
        modeLabel = `Random Pattern Progression: ${result.patterns.map(p => p.name).join(' → ')}`;
      } else {
        const selectedPatterns = Array.from(document.querySelectorAll('.progressionSelect')).map(s => s.value).filter(Boolean).map(getPatternById);
        if (!selectedPatterns.length) { setStatus('renderStatus','Choose at least one pattern for the progression.', true); return; }
        let baseSeq = [];
        for (const pattern of selectedPatterns) {
          const missing = pattern.fragments.filter(id => !findFragmentByPatternId(id));
          if (missing.length) { setStatus('renderStatus', `Missing fragments for ${pattern.name}: ${missing.join(', ')}. Check file names.`, true); return; }
          baseSeq = baseSeq.concat(resolvePatternFragments(pattern));
        }
        sequence = buildRepeatedSequence(baseSeq, total);
        modeLabel = `Pattern Progression: ${selectedPatterns.map(p => p.name).join(' → ')}`;
      }
    } else if (mode === 'hybrid') {
      const result = buildHybridSequence(total);
      if (result.error) { setStatus('renderStatus', result.error, true); return; }
      sequence = result.sequence;
      modeLabel = `Hybrid Pattern/Random: ${result.labels.join(' → ')}`;
    } else {
      sequence = pickRandomSequence(total, $('repeatSelect').value);
    }

    const sequenceForStudy = expandSequenceWithPhraseRests(sequence, fragsPerBar);
    const pauseInfo = sequenceForStudy.length > sequence.length ? ` + 2-bar rests after each 2-bar phrase` : '';
    state.sequence = sequenceForStudy; 
    state.generatedXml = buildScoreFromFragments(sequenceForStudy, fragsPerBar); 
    state.events = parsePlaybackEventsFromGeneratedXml(state.generatedXml);
    renderSequence();
    state.currentStudyMeta = { modeLabel, bars };
    $('summary').textContent = `${bars} bars in 2/4 — ${modeLabel}${pauseInfo} — ${sequenceForStudy.length} 1/4 units. Sound events: ${state.events.length}.`;
    ['playBtn','stopBtn','printBtn','saveStudyBtn'].forEach(id => $(id).disabled = false);
    await renderXml(state.generatedXml);
  }


  function renderSequence() { 
    $('sequence').innerHTML = state.sequence.map((f,i) => {
      const cls = f.quality === 'REST' ? '' : qualityClass(f);
      const label = f.quality === 'REST' ? 'Rest' : escapeXml(f.id);
      const pickup = f.isPickup ? ' pickup-pill' : '';
      const prefix = f.isPickup ? '<span class="pickup-label">pickup</span> ' : `${i+1}. `;
      return `<span class="pill ${cls}${pickup}">${prefix}${label}</span>`;
    }).join(''); 
  }

  function ensureSynths() {
    if (!state.synthWoodblock) {
      state.synthWoodblock = new Tone.MembraneSynth({
        pitchDecay:.003,
        octaves:.45,
        oscillator:{type:'square'},
        envelope:{attack:.001,decay:.028,sustain:0,release:.006},
        volume:-9
      }).toDestination();
    }
    if (!state.synthClave) {
      state.synthClave = new Tone.MembraneSynth({
        pitchDecay:.002,
        octaves:.28,
        oscillator:{type:'triangle'},
        envelope:{attack:.001,decay:.022,sustain:0,release:.004},
        volume:-7
      }).toDestination();
    }
    if (!state.synthClap) {
      const clapFilter = new Tone.Filter(1700,'bandpass').toDestination();
      state.synthClap = new Tone.NoiseSynth({
        noise:{type:'white'},
        envelope:{attack:.001,decay:.055,sustain:0,release:.01},
        volume:-7
      }).connect(clapFilter);
    }
    if (!state.synthMetronome) {
      state.synthMetronome = new Tone.MembraneSynth({
        pitchDecay:.002,
        octaves:.35,
        oscillator:{type:'square'},
        envelope:{attack:.001,decay:.025,sustain:0,release:.004},
        volume:-14
      }).toDestination();
    }
  }

  function getStudyVolume() {
    const v = Number($('studyVolumeInput')?.value || 100) / 100;
    return Math.max(0, Math.min(2, v));
  }

  function getTrackVolumeDb() {
    const linear = Math.max(0.001, Math.min(1, Number($('trackVolumeInput')?.value || 70) / 100));
    return 20 * Math.log10(linear);
  }

  function triggerCountIn(beatIndex, time) {
    ensureSynths();
    const isFirst = beatIndex === 0;
    state.synthWoodblock.triggerAttackRelease(isFirst ? 'C6' : 'G5', '32n', time, isFirst ? .95 : .72);
  }

  function triggerPercussion(ev, time) {
    const sound = $('soundSelect') ? $('soundSelect').value : 'woodblock';
    if (sound === 'mute') return;
    const vol = getStudyVolume();
    if (vol <= 0) return;
    const velocity = Math.max(0, Math.min(1, .82 * vol));

    if (sound === 'clave') {
      state.synthClave.triggerAttackRelease('C6','32n',time, velocity);
      return;
    }
    if (sound === 'clap') {
      state.synthClap.triggerAttackRelease('32n', time, velocity * .95);
      return;
    }
    state.synthWoodblock.triggerAttackRelease('G5','32n',time, velocity);
  }

  function triggerMetronome(beatIndex, time) {
    const isDownbeat = beatIndex % 2 === 0;
    state.synthMetronome.triggerAttackRelease(isDownbeat ? 'C6' : 'G5', '32n', time, isDownbeat ? .55 : .38);
  }

  function resetPlayback() {
    try { Tone.Transport.stop(); } catch(e) {}
    try { Tone.Transport.cancel(0); } catch(e) {}
    Tone.Transport.loop = false;
    Tone.Transport.position = 0;
    stopBacking();
  }
  function stopPlayback() { resetPlayback(); state.isPlaying = false; updatePlayButtonState(); }
  function invalidatePlayback() { if (state.isPlaying) resetPlayback(); state.isPlaying = false; updatePlayButtonState(); }
  function updatePlayButtonState() { const btn = $('playBtn'); if (btn && !state.isStarting) btn.disabled = !state.events.length; }
  function getLastQuarter() { return state.sequence && state.sequence.length ? state.sequence.length : (state.events.length ? Math.max(...state.events.map(e => e.timeQ + e.durationQ),0) : 0); }

  async function play({ callResponse=false } = {}) {
    if (!state.events.length || state.isStarting) return;
    state.isStarting = true;
    const btn = $('playBtn'); if (btn) btn.disabled = true;
    try {
      await Tone.start();
      ensureSynths();
      resetPlayback();

      const bpm = Number($('bpmInput').value || 80);
      Tone.Transport.bpm.value = bpm;
      const quarterSec = 60 / bpm;
      const countInQ = 4;
      const countInSec = countInQ * quarterSec;
      const lastQ = getLastQuarter();
      const responseGapQ = callResponse ? lastQ : 0;
      const studyLenSec = (lastQ + responseGapQ) * quarterSec;
      const loopEndSec = countInSec + studyLenSec;

      await prepareBackingPlayer();

      for (let i = 0; i < countInQ; i++) {
        Tone.Transport.schedule(time => triggerCountIn(i, time), i * quarterSec);
      }

      state.events.forEach(ev => Tone.Transport.schedule(time => triggerPercussion(ev,time), countInSec + ev.timeQ * quarterSec));

      const hasBackingTrack = !!getSelectedTrack();
      if (!hasBackingTrack) {
        for (let beat = 0; beat < lastQ; beat++) {
          Tone.Transport.schedule(time => triggerMetronome(beat, time), countInSec + beat * quarterSec);
        }
      }

      if ($('loopInput').checked) {
        Tone.Transport.loop = true;
        Tone.Transport.loopStart = countInSec;
        Tone.Transport.loopEnd = loopEndSec;
      } else {
        Tone.Transport.loop = false;
        Tone.Transport.scheduleOnce(() => stopPlayback(), loopEndSec + .05);
      }

      scheduleBacking(countInSec, loopEndSec, countInSec);
      Tone.Transport.start('+0.05');
      state.isPlaying = true;
    } finally {
      state.isStarting = false;
      if (btn) btn.disabled = !state.events.length;
    }
  }

  function loadAudioLibrary() {
    state.audioTracks = AUDIO_TRACKS.map(t => Object.assign({}, t));
    renderAudioTracks();
    setStatus('audioStatus', state.audioTracks.length ? `${state.audioTracks.length} backing track(s) loaded from assets/audio/.` : 'No backing tracks found in assets/audio/.', !state.audioTracks.length);
  }



  function renderAudioTracks() {
    const select = $('backingSelect');
    select.innerHTML = '<option value="">No track — metronome only</option>' + state.audioTracks.map(t => `<option value="${escapeXml(t.id)}">${escapeXml(t.name)}</option>`).join('');
    if (state.audioTracks[0]) select.value = state.audioTracks[0].id;
    updateTrackBpmFromSelection();
  }

  function getSelectedTrack() { return state.audioTracks.find(t => t.id === $('backingSelect').value) || null; }
  function updateTrackBpmFromSelection() { /* no-op: originalBpm now comes from manifest.js per track */ }

  async function prepareBackingPlayer() {
    const t = getSelectedTrack();
    if (!t) return false;

    const studyBpm = Number($('bpmInput').value || 100);
    const originalBpm = t.originalBpm || t.bpm || 100;
    const playbackRate = studyBpm / originalBpm;

    if (!state.backingPlayer || state.currentPlayerTrackId !== t.id) {
      stopBacking();
      if (state.backingPlayer) {
        try { state.backingPlayer.dispose(); } catch(e) {}
      }
      // GrainPlayer time-stretches via granular synthesis: playbackRate changes
      // speed WITHOUT changing pitch (unlike Tone.Player, which resamples the
      // buffer and shifts pitch together with speed).
      state.backingPlayer = new Tone.GrainPlayer({
        url: t.url,
        loop: false,
        autostart: false,
        grainSize: 0.06,
        overlap: 0.2
      }).toDestination();
      state.currentPlayerTrackId = t.id;
      await Tone.loaded();
    }

    state.backingPlayer.volume.value = getTrackVolumeDb();
    state.backingPlayer.playbackRate = playbackRate;
    return true;
  }

  function scheduleBacking(startTransportSec, loopEndSec, countInSec) {
    const t = getSelectedTrack();
    if (!t || !state.backingPlayer) return;

    const studyDurationSec = Math.max(0.001, loopEndSec - countInSec);

    const startBackingNow = (time) => {
      try { state.backingPlayer.stop(time); } catch(e) {}
      state.backingPlayer.loop = false;
      state.backingPlayer.start(time, 0);
      if (!$('loopInput').checked) {
        state.backingPlayer.stop(time + studyDurationSec);
      }
    };

    // Start once after the count-in.
    Tone.Transport.scheduleOnce((time) => startBackingNow(time), startTransportSec);

    // Re-trigger the backing track every time the Transport loop restarts,
    // instead of letting GrainPlayer loop on its own internal timer — that
    // timer runs independently of the Transport clock and drifts out of
    // sync with the notation/metronome over several cycles.
    if (state.backingLoopHandler) Tone.Transport.off('loop', state.backingLoopHandler);
    state.backingLoopHandler = (time) => { if ($('loopInput').checked) startBackingNow(time); };
    Tone.Transport.on('loop', state.backingLoopHandler);
  }

  function stopBacking() {
    try {
      if (state.backingLoopHandler) { Tone.Transport.off('loop', state.backingLoopHandler); state.backingLoopHandler = null; }
      if (state.backingPlayer) {
        state.backingPlayer.loop = false;
        state.backingPlayer.stop(Tone.now());
      }
    } catch(e) {}
    state.audioEl.pause(); 
    try { state.audioEl.currentTime = 0; } catch(e) {}
  }
  function clearAudioTracks() { stopBacking(); if (state.backingPlayer) { try { state.backingPlayer.dispose(); } catch(e) {} state.backingPlayer = null; state.currentPlayerTrackId = null; } loadAudioLibrary(); }

  function updateGenerateState() { $('generateBtn').disabled = state.fragments.length === 0; }
  function updateModeUI() {
    updateModePanels();
    if ($('modeSelect').value === 'manual') buildManualGrid(false);
  }

  $('backingSelect').addEventListener('change', invalidatePlayback);
  $('modeSelect').addEventListener('change', () => { invalidatePlayback(); updateModeUI(); });
  $('traditionalPatternSelect').addEventListener('change', updateTraditionalPatternInfo);
  $('progressionModeSelect').addEventListener('change', updateProgressionModeUI);
  $('barsInput').addEventListener('change', () => { invalidatePlayback(); buildManualGridIfNeeded(); });
  $('buildManualBtn').addEventListener('click', () => buildManualGrid(true));
  $('clearManualBtn').addEventListener('click', clearManualGrid);
  $('generateBtn').addEventListener('click', generate);
  $('playBtn').addEventListener('click', () => play({ callResponse:false }));
  $('stopBtn').addEventListener('click', stopPlayback);
  $('loopInput').addEventListener('change', invalidatePlayback);
  $('phraseRestInput').addEventListener('change', invalidatePlayback);
  $('printBtn').addEventListener('click', () => window.print());
  $('bpmInput').addEventListener('input', () => { $('bpmValue').textContent = $('bpmInput').value; invalidatePlayback(); });
  $('trackVolumeInput').addEventListener('input', () => { state.audioEl.volume = Number($('trackVolumeInput').value || 70)/100; if (state.backingPlayer) state.backingPlayer.volume.value = getTrackVolumeDb(); });
  $('studyVolumeInput').addEventListener('input', () => { $('studyVolumeValue').textContent = $('studyVolumeInput').value; });

  $('saveStudyBtn').addEventListener('click', saveCurrentStudy);
  $('loadStudyBtn').addEventListener('click', loadSavedStudy);
  $('deleteStudyBtn').addEventListener('click', deleteSavedStudy);
  $('exportStudiesBtn').addEventListener('click', exportSavedStudies);
  $('importStudiesBtn').addEventListener('click', () => $('importStudiesInput').click());
  $('importStudiesInput').addEventListener('change', e => importSavedStudiesFile(e.target.files && e.target.files[0]));
  if ($('hybridPatternSourceSelect')) $('hybridPatternSourceSelect').addEventListener('change', updateHybridModeUI);
  if ($('hybridFormSelect')) $('hybridFormSelect').addEventListener('change', updateHybridModeUI);
  loadFragmentLibrary();
  loadAudioLibrary();
  restoreSavedStudiesFromBrowser();
  populatePatternSelects();
  updateModeUI();
