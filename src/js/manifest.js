// Built-in asset manifest.
// To add a new rhythmic fragment: drop a MusicXML file into assets/fragments/
// and add its filename below. To add a backing track: drop the audio file into
// assets/audio/ and add an entry to AUDIO_TRACKS below.

const FRAGMENT_FILES = [
  'A1.xml', 'A2.xml', 'A3.xml', 'A4.xml', 'A5.xml', 'A6.xml', 'A7.xml',
  'B1.xml', 'B2.xml', 'B3.xml', 'B4.xml', 'B5.xml',
  'B6.xml', 'B7.xml', 'B8.xml', 'B9.xml', 'B10.xml'
];

// Each backing track ships as several pre-rendered tempo versions (offline
// pitch-preserving time-stretch, studio quality — no realtime processing in
// the browser). "tempos" lists the available BPM files as
// assets/audio/<id>_<bpm>.mp3. Study BPM is snapped to the nearest available
// tempo whenever a track is selected, so notation and audio always share the
// exact same tempo (no drift). To add more tempo steps to an existing track:
// render a new assets/audio/<id>_<bpm>.mp3 file and add that bpm to "tempos".
// "suggestedBpm" is only a starting point: selecting a track sets the study
// BPM to this value, and the musician is then free to change it at will.
// Must be one of the values listed in that track's "tempos".
const ALL_TEMPOS = [60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140];
const AUDIO_TRACKS = [
  { id: 'baiao',       name: 'Baião',        suggestedBpm: 100, tempos: ALL_TEMPOS },
  { id: 'batucada',    name: 'Batucada',     suggestedBpm: 100, tempos: ALL_TEMPOS },
  { id: 'frevo',       name: 'Frevo',        suggestedBpm: 120, tempos: ALL_TEMPOS },
  { id: 'afoxe',       name: 'Ijexá',        suggestedBpm: 100, tempos: ALL_TEMPOS },
  { id: 'maracatu',    name: 'Maracatu',     suggestedBpm: 100, tempos: ALL_TEMPOS },
  { id: 'partidoalto', name: 'Partido Alto', suggestedBpm: 100, tempos: ALL_TEMPOS },
  { id: 'samba',       name: 'Samba',        suggestedBpm: 100, tempos: ALL_TEMPOS },
  { id: 'sambafunk',   name: 'Samba Funk',   suggestedBpm: 95,  tempos: ALL_TEMPOS },
  { id: 'xote',        name: 'Xote',         suggestedBpm: 100, tempos: ALL_TEMPOS }
];

// Experimental: harmonic pads (tempo-free, transposed live via pitch-shift).
// Each chord "quality" now ships with SEVERAL reference recordings (spaced a
// minor third apart) instead of just one. The app picks whichever reference
// is closest to the requested key and pitch-shifts only the remaining
// distance (max 1-2 semitones), which keeps the pitch-shift artifacts to a
// minimum. To add a new chord quality: record references spaced a minor or
// major third apart, drop them in assets/audio/pads/, and list them here.
// Each chord quality ships with all 12 keys recorded, so the app always
// finds the exact key and never needs to transpose. "category" only groups
// the entries in the selector.
const PAD_TRACKS = [
  {
    id: 'maj9',
    name: 'Maj9',
    category: 'Major',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/maj9_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/maj9_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/maj9_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/maj9_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/maj9_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/maj9_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/maj9_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/maj9_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/maj9_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/maj9_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/maj9_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/maj9_B.mp3' }
    ]
  },
  {
    id: '6-9',
    name: '6/9',
    category: 'Major',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/6-9_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/6-9_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/6-9_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/6-9_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/6-9_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/6-9_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/6-9_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/6-9_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/6-9_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/6-9_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/6-9_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/6-9_B.mp3' }
    ]
  },
  {
    id: 'maj9-sharp11',
    name: 'Maj9(#11)',
    category: 'Major',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/maj9-sharp11_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/maj9-sharp11_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/maj9-sharp11_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/maj9-sharp11_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/maj9-sharp11_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/maj9-sharp11_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/maj9-sharp11_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/maj9-sharp11_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/maj9-sharp11_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/maj9-sharp11_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/maj9-sharp11_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/maj9-sharp11_B.mp3' }
    ]
  },
  {
    id: 'm9',
    name: 'm9',
    category: 'Minor',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/m9_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/m9_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/m9_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/m9_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/m9_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/m9_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/m9_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/m9_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/m9_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/m9_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/m9_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/m9_B.mp3' }
    ]
  },
  {
    id: 'm11',
    name: 'm11',
    category: 'Minor',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/m11_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/m11_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/m11_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/m11_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/m11_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/m11_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/m11_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/m11_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/m11_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/m11_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/m11_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/m11_B.mp3' }
    ]
  },
  {
    id: 'm-maj9',
    name: 'm(maj9)',
    category: 'Minor',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/m-maj9_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/m-maj9_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/m-maj9_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/m-maj9_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/m-maj9_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/m-maj9_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/m-maj9_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/m-maj9_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/m-maj9_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/m-maj9_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/m-maj9_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/m-maj9_B.mp3' }
    ]
  },
  {
    id: 'm6-9',
    name: 'm6/9',
    category: 'Minor',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/m6-9_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/m6-9_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/m6-9_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/m6-9_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/m6-9_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/m6-9_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/m6-9_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/m6-9_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/m6-9_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/m6-9_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/m6-9_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/m6-9_B.mp3' }
    ]
  },
  {
    id: '13',
    name: '13',
    category: 'Dominant',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/13_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/13_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/13_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/13_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/13_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/13_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/13_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/13_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/13_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/13_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/13_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/13_B.mp3' }
    ]
  },
  {
    id: '13sus4',
    name: '13sus4',
    category: 'Dominant',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/13sus4_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/13sus4_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/13sus4_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/13sus4_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/13sus4_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/13sus4_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/13sus4_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/13sus4_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/13sus4_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/13sus4_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/13sus4_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/13sus4_B.mp3' }
    ]
  },
  {
    id: '13-sharp11',
    name: '13(#11)',
    category: 'Dominant',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/13-sharp11_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/13-sharp11_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/13-sharp11_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/13-sharp11_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/13-sharp11_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/13-sharp11_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/13-sharp11_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/13-sharp11_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/13-sharp11_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/13-sharp11_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/13-sharp11_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/13-sharp11_B.mp3' }
    ]
  },
  {
    id: '13-b9',
    name: '13(b9)',
    category: 'Dominant',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/13-b9_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/13-b9_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/13-b9_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/13-b9_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/13-b9_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/13-b9_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/13-b9_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/13-b9_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/13-b9_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/13-b9_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/13-b9_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/13-b9_B.mp3' }
    ]
  },
  {
    id: '7-b9-b13',
    name: '7(b9,b13)',
    category: 'Dominant',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/7-b9-b13_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/7-b9-b13_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/7-b9-b13_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/7-b9-b13_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/7-b9-b13_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/7-b9-b13_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/7-b9-b13_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/7-b9-b13_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/7-b9-b13_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/7-b9-b13_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/7-b9-b13_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/7-b9-b13_B.mp3' }
    ]
  },
  {
    id: '7-9-b13',
    name: '7(9,b13)',
    category: 'Dominant',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/7-9-b13_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/7-9-b13_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/7-9-b13_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/7-9-b13_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/7-9-b13_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/7-9-b13_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/7-9-b13_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/7-9-b13_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/7-9-b13_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/7-9-b13_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/7-9-b13_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/7-9-b13_B.mp3' }
    ]
  },
  {
    id: '7alt',
    name: '7alt',
    category: 'Dominant',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/7alt_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/7alt_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/7alt_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/7alt_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/7alt_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/7alt_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/7alt_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/7alt_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/7alt_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/7alt_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/7alt_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/7alt_B.mp3' }
    ]
  },
  {
    id: '7sus4-b9',
    name: '7sus4(b9)',
    category: 'Dominant',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/7sus4-b9_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/7sus4-b9_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/7sus4-b9_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/7sus4-b9_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/7sus4-b9_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/7sus4-b9_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/7sus4-b9_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/7sus4-b9_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/7sus4-b9_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/7sus4-b9_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/7sus4-b9_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/7sus4-b9_B.mp3' }
    ]
  },
  {
    id: 'm7b5-11',
    name: 'm7b5(11)',
    category: 'Half-diminished / diminished',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/m7b5-11_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/m7b5-11_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/m7b5-11_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/m7b5-11_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/m7b5-11_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/m7b5-11_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/m7b5-11_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/m7b5-11_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/m7b5-11_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/m7b5-11_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/m7b5-11_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/m7b5-11_B.mp3' }
    ]
  },
  {
    id: 'dim7-9',
    name: 'dim7(9)',
    category: 'Half-diminished / diminished',
    refs: [
      { rootNote: 'C', url: 'assets/audio/pads/dim7-9_C.mp3' },
      { rootNote: 'C#', url: 'assets/audio/pads/dim7-9_Db.mp3' },
      { rootNote: 'D', url: 'assets/audio/pads/dim7-9_D.mp3' },
      { rootNote: 'D#', url: 'assets/audio/pads/dim7-9_Eb.mp3' },
      { rootNote: 'E', url: 'assets/audio/pads/dim7-9_E.mp3' },
      { rootNote: 'F', url: 'assets/audio/pads/dim7-9_F.mp3' },
      { rootNote: 'F#', url: 'assets/audio/pads/dim7-9_Gb.mp3' },
      { rootNote: 'G', url: 'assets/audio/pads/dim7-9_G.mp3' },
      { rootNote: 'G#', url: 'assets/audio/pads/dim7-9_Ab.mp3' },
      { rootNote: 'A', url: 'assets/audio/pads/dim7-9_A.mp3' },
      { rootNote: 'A#', url: 'assets/audio/pads/dim7-9_Bb.mp3' },
      { rootNote: 'B', url: 'assets/audio/pads/dim7-9_B.mp3' }
    ]
  }
];
