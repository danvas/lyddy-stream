export const TOGGLE_PLAY = 'TOGGLE_PLAY';
export const STOP_PLAY = 'stop_play';
export const DEQUEUE_LYD = 'dequeue_lyd';
export const ENQUEUE_LYD = 'enqueue_lyd';
export const SKIP_LYD = 'SKIP_LYD';
export const UPDATE_QUEUE = 'UPDATE_QUEUE';

export const togglePlay = currentId => {
    return {
        type: TOGGLE_PLAY,
        currentId
    }
}

export const skipLyd = amount => ({
    type: SKIP_LYD,
    amount
})

export const dequeueLyd = lydId => {
    
    return {
        type: DEQUEUE_LYD,
        lydId
    }
}

export const enqueueLyd = lydId => {
    return {
        type: ENQUEUE_LYD,
        lydId
    }
}

export const updateQueue  = queuedIds => {
    
    return {
        type: UPDATE_QUEUE,
        queuedIds
    }
}


const structure = {
    isFetching: true,
    didInvalidate: false,

    user: {
        uid: 'F7G80ZQ0QffjiWtHT51tU8ztHRq1',
        alias_name: "nielvas",
        name: "Daniel Vasquez",
        followers: [],
        following: [],
        playlists: {
            home: ["-KzrdRazPRO_b_DfeSPw", "-L-QxtCmuvQspvwRCNTz", "-L-U709qq_ve6Xj3K7KX", "-L-jsNBCJhPN2zB9YLR7", "-L-pDMLDpSMd1dobJpA2", "-L6FuG6bL2cFLBfBsN4X", "-L86Q_Z_aNzez95j3AdF", "-L8Tb5uH0RcF2tZJEFLa", "-L8aUhZ5ihQ3AFW5Wen4", "-L8fWsCf76TvxVky90aB", "-L8fqBwHR9YWoO4v4_U2", "-L8rjaLkUX0L_YuOkUyJ", "-L8xaKdri-RIS9YJDwuS"],
            playlist01: ["-L8xaKdri-RIS9YJDwuS", "-L8rjaLkUX0L_YuOkUyJ", "-L8fWsCf76TvxVky90aB", "-L8aUhZ5ihQ3AFW5Wen4", "-L86Q_Z_aNzez95j3AdF", "-L-pDMLDpSMd1dobJpA2", "-L-U709qq_ve6Xj3K7KX"]}
    },

    player: {
        isPlaying: false,
        channel: "-F95jL86Q_Z_aN3AdF",
        currentLyd: "-L-pDMLDpSMd1dobJpA2",
        queueIndex: -1,
        queuedLyds: []},

    posts: {"-L-jsNBCJhPN2zB9YLR7": {
        "user_id":"F7G80ZQ0QffjiWtHT51tU8ztHRq1",
        "public": true,
        "artists":["Brian Eno",
        "Kevin Shields"],
        "caption":"new stuff!!",
        "date_added":"2017-11-06T23:29:56-08:00",
        "hashtags":["chill", "ambient"],
        "liked_by":[""],
        "name":"Only Once Away My Son",
        "source":"https://www.youtube.com/watch?v=HJlmCtpOfNU"},
    "-L-pDMLDpSMd1dobJpA2": {
        "user_id":"F7G80ZQ0QffjiWtHT51tU8ztHRq1",
        "public": true,
        "artists":["Laid Back"],
        "date_added":"2017-12-08T00:24:06-08:00",
        "liked_by":["someoneElsy"],
        "name":"Fly Away/Walking In The Sunshine",
        "source":"https://www.youtube.com/watch?v=2yHrF_fSy24"},
    "-L86Q_Z_aNzez95j3AdF": {
        "user_id":"F7G80ZQ0QffjiWtHT51tU8ztHRq1",
        "public": true,
        "artists":["Nino Soprano"],
        "caption":"",
        "date_added":"2018-03-21T00:20:59-07:00",
        "hashtags":["spaghettiwestern"],
        "name":"Sigla di Nino Soprano",
        "source":"https://www.youtube.com/watch?v=RfLIjNWyAzk"}
},

}