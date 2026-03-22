// Radio message data and system
// Original: 7 categories with English messages displayed in scrolling log

export interface RadioCategory {
  key: string;
  messages: string[];
}

export const RADIO_MESSAGES: RadioCategory[] = [
  {
    key: 'DAMAGE',
    messages: [
      "I'm hit!",
      'Suspect is armed!',
      'Gun!!!',
      'Dispatch, 11-99!',
      'Contact!',
      'We need backup here!',
      'Shots fired!',
      'Request 10-52',
      'Paramedic!',
      'Cover me!',
    ],
  },
  {
    key: 'DEAD',
    messages: [
      'I need help!',
      'Dispatch, CODE 99!',
      'Officer down!',
    ],
  },
  {
    key: 'KILL',
    messages: [
      'One subject is down!',
      'Suspect is down!',
      'Clear!',
      'Area is clear, over.',
    ],
  },
  {
    key: 'ARRIVE',
    messages: [
      'Dispatch, 10-23',
      'Dispatch, We are on scene.',
    ],
  },
  {
    key: 'SCENE',
    messages: [
      'Where is!',
      'Surrender!',
      'Subject is armed!',
      'Area is clear, over.',
    ],
  },
  {
    key: 'FF',
    messages: [
      "I'm blue!",
      "Don't shoot me!",
      'Stop!',
      'Crossfire!',
    ],
  },
  {
    key: 'ARREST',
    messages: [
      'Suspect is in custody.',
      'Subject is in custody.',
      'Apprehend!',
      'Arrest him!',
    ],
  },
];
