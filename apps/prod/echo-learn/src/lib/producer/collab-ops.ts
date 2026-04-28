import type {
  CollabOperation,
  PatternBar,
  MixerTrack,
  ProducerProjectData,
} from '@/types/producer';

/**
 * Apply a collaboration operation to the current project state.
 * Returns a new state object (immutable).
 */
export function applyOperation(
  state: ProducerProjectData,
  op: CollabOperation,
): ProducerProjectData {
  switch (op.type) {
    case 'drum_toggle': {
      return {
        ...state,
        bars: state.bars.map((bar) => {
          if (bar.id !== op.barId) return bar;
          const steps = [...(bar.drumPattern[op.soundId] || new Array(16).fill(false))];
          steps[op.step] = op.value;
          return { ...bar, drumPattern: { ...bar.drumPattern, [op.soundId]: steps } };
        }),
      };
    }

    case 'melody_toggle': {
      return {
        ...state,
        bars: state.bars.map((bar) => {
          if (bar.id !== op.barId) return bar;
          const steps = [...(bar.melodyPattern[op.noteName] || new Array(16).fill(false))];
          steps[op.step] = op.value;
          return { ...bar, melodyPattern: { ...bar.melodyPattern, [op.noteName]: steps } };
        }),
      };
    }

    case 'bass_toggle': {
      return {
        ...state,
        bars: state.bars.map((bar) => {
          if (bar.id !== op.barId) return bar;
          const currentBassPattern = bar.bassPattern || {};
          const steps = [...(currentBassPattern[op.noteName] || new Array(16).fill(false))];
          steps[op.step] = op.value;
          const newBassPattern = { ...currentBassPattern, [op.noteName]: steps };
          // Monophonic: clear other notes on this step if turning ON
          if (op.value) {
            for (const key of Object.keys(newBassPattern)) {
              if (key !== op.noteName && newBassPattern[key]?.[op.step]) {
                newBassPattern[key] = [...newBassPattern[key]];
                newBassPattern[key][op.step] = false;
              }
            }
          }
          return { ...bar, bassPattern: newBassPattern };
        }),
      };
    }

    case 'piano_roll_note': {
      return {
        ...state,
        bars: state.bars.map((bar) => {
          if (bar.id !== op.barId) return bar;
          const notes = bar.pianoRollNotes || [];
          switch (op.action) {
            case 'add':
              return { ...bar, pianoRollNotes: [...notes, op.note] };
            case 'update':
              return {
                ...bar,
                pianoRollNotes: notes.map((n) => (n.id === op.note.id ? op.note : n)),
              };
            case 'delete':
              return {
                ...bar,
                pianoRollNotes: notes.filter((n) => n.id !== op.note.id),
              };
            default:
              return bar;
          }
        }),
      };
    }

    case 'automation_change': {
      return {
        ...state,
        bars: state.bars.map((bar) => {
          if (bar.id !== op.barId) return bar;
          const lanes = bar.automationLanes || [];
          const existingIdx = lanes.findIndex((l) => l.parameterId === op.lane.parameterId);
          if (existingIdx >= 0) {
            const updated = [...lanes];
            updated[existingIdx] = op.lane;
            return { ...bar, automationLanes: updated };
          }
          return { ...bar, automationLanes: [...lanes, op.lane] };
        }),
      };
    }

    case 'bpm_change': {
      return { ...state, bpm: op.bpm };
    }

    case 'mixer_change': {
      return {
        ...state,
        mixerTracks: state.mixerTracks.map((track: MixerTrack) =>
          track.id === op.trackId ? { ...track, ...op.update } : track,
        ),
      };
    }

    case 'bar_add': {
      return {
        ...state,
        bars: [...state.bars, op.bar],
      };
    }

    case 'bar_delete': {
      const remaining = state.bars.filter((b: PatternBar) => b.id !== op.barId);
      if (remaining.length === 0) return state; // don't delete last bar
      return {
        ...state,
        bars: remaining,
        arrangement: state.arrangement.filter((id: string) => id !== op.barId),
        activeBarId: state.activeBarId === op.barId ? remaining[0].id : state.activeBarId,
      };
    }

    case 'arrangement_change': {
      return { ...state, arrangement: op.arrangement };
    }

    case 'presence':
    case 'chat':
      // These don't modify project data — handled by the hook
      return state;

    default:
      return state;
  }
}
