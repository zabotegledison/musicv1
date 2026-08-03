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
const AUDIO_TRACKS = [
  { id: 'afoxe',    name: 'Ijexá',    tempos: [60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140] },
  { id: 'baiao',    name: 'Baião',    tempos: [60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140] },
  { id: 'batucada', name: 'Batucada', tempos: [60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140] }
];

// Experimental: harmonic pads (tempo-free, transposed live via pitch-shift).
// Each entry is ONE recording in a reference root ("rootNote"); the app
// transposes it in real time to whichever key the user selects. To add a
// new chord quality: drop the file in assets/audio/pads/ and add an entry
// here with its reference root note.
const PAD_TRACKS = [
  { id: 'm11', name: 'Minor 11', url: 'assets/audio/pads/m11.mp3', rootNote: 'C' }
];
