import { TOGGLE_PLAY,
         DEQUEUE_LYD,
         SKIP_LYD,
         ENQUEUE_LYD,
         UPDATE_QUEUE } from '../actions/PlayerActions'

const defaultState = {queueIdx:0, playing: false, queuedIds:[]}
export const playerReducer = (state=defaultState, action) => {
    const loopList = false
    let queueIdx = state.queueIdx
    let currentId = state.currentId
    let playing = state.playing
    let queuedIds = []
    switch (action.type) {

        case TOGGLE_PLAY:
            if (action.currentId === state.currentId){
                playing = !state.playing
            } else if (!action.currentId) {
                playing = false
            } else {
                playing = true
                queueIdx = state.queuedIds.findIndex(
                    id => id === action.currentId)
                currentId = state.queuedIds[queueIdx]
            }

            return { ...state,
                    playing,
                    currentId,
                    queueIdx}

        case DEQUEUE_LYD:
            let newState = {}
            queuedIds = [...state.queuedIds]
            var index = queuedIds.indexOf(action.lydId);
            if (index > -1) {
                queuedIds.splice(index, 1);
                newState = { ...state, queuedIds}
            } else {
                newState = { ...state}   
            }
            return newState

        case ENQUEUE_LYD:
            queuedIds = [action.lydId, ...state.queuedIds]
            return {...state, queuedIds}

        case SKIP_LYD:
            queueIdx = state.queueIdx + action.amount
            currentId = state.queuedIds[queueIdx]
            if (!currentId) {
                playing = false
                queueIdx = 0
            }

            return { ...state, currentId, queueIdx, playing}

        case UPDATE_QUEUE:
            queuedIds = action.queuedIds
            queueIdx = queuedIds.findIndex(id => id === state.currentId)
            currentId = queuedIds[queueIdx]
            return {...state, queuedIds, currentId}
        
        default:
            return state;
    }
}

