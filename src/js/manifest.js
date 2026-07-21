// Built-in asset manifest.
// To add a new rhythmic fragment: drop a MusicXML file into assets/fragments/
// and add its filename below. To add a backing track: drop the audio file into
// assets/audio/ and add an entry to AUDIO_TRACKS below.

const FRAGMENT_FILES = [
  'A1.xml', 'A2.xml', 'A3.xml', 'A4.xml', 'A5.xml', 'A6.xml',
  'B1.xml', 'B2.xml', 'B3.xml', 'B4.xml', 'B5.xml',
  'B6.xml', 'B7.xml', 'B8.xml', 'B9.xml', 'B10.xml'
];

const AUDIO_TRACKS = [
  { id: 'afoxe',    name: 'Afoxé (100 BPM, 16 bars)',    url: 'assets/audio/afoxe.mp3',    originalBpm: 100 },
  { id: 'baiao',    name: 'Baião (100 BPM, 16 bars)',    url: 'assets/audio/baiao.mp3',    originalBpm: 100 },
  { id: 'batucada', name: 'Batucada (100 BPM, 16 bars)', url: 'assets/audio/batucada.mp3', originalBpm: 100 }
];
