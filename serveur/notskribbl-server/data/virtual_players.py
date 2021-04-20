from data.words import ENGLISH_TAG, FRENCH_TAG

START_TAG = 'start'
WIN_TAG = 'win'
LOSE_TAG = 'lose'
EMPTY_HINTS_TAG = 'empty_hints'

PLAYERS = {
    'nice': {
        'responses': {
            ENGLISH_TAG: {
                START_TAG: 'Good luck!',
                WIN_TAG: 'Well played!',
                LOSE_TAG: 'Better luck next time!',
                EMPTY_HINTS_TAG: 'Sorry, no more hints :('
            },
            FRENCH_TAG: {
                START_TAG: 'Bonne chance!',
                WIN_TAG: 'Bien joué!',
                LOSE_TAG: 'Bien essayé!',
                EMPTY_HINTS_TAG: "Désolé, plus d'indices :("
            }
        }
    },
    'rude': {
        'responses': {
            ENGLISH_TAG: {
                START_TAG: 'Why am I playing with a toddler?',
                WIN_TAG: "I'll get you next time!",
                LOSE_TAG: "I'm way too good for you.",
                EMPTY_HINTS_TAG: "You still can't guess the word? Pathetic."
            },
            FRENCH_TAG: {
                START_TAG: 'Pourquoi est-ce que je joue avec un enfant?',
                WIN_TAG: "Je t'aurai la prochaine fois!",
                LOSE_TAG: 'Je suis beaucoup trop bon pour toi.',
                EMPTY_HINTS_TAG: "Tu n'arrives toujours pas à deviner le mot? Pathétique."
            }
        }
    },
    'arrogant': {
        'responses': {
            ENGLISH_TAG: {
                START_TAG: 'This will be easy.',
                WIN_TAG: "That was a practice round, let's get serious now.",
                LOSE_TAG: 'That was indeed way too easy!',
                EMPTY_HINTS_TAG: "Anyone would have guessed the word by now..."
            },
            FRENCH_TAG: {
                START_TAG: 'Ce sera facile.',
                WIN_TAG: "C'était un tour de pratique, soyons sérieux maintenant.",
                LOSE_TAG: "C'était en effet beaucoup trop facile!",
                EMPTY_HINTS_TAG: "N'importe qui aurait déjà deviné le mot..."
            }
        }
    }
}