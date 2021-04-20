export enum Text {
    REQUIRED = "required",
    USERNAME = "username",
    
    MINIMUM = "min",
    MAXIMUM = "max",
    
    MINIMUMPASSWORD = "minPswd",
    MAXIMUMPASSWORD = "maxPswd",
    
    PASSWORDMATCH = "pswdMatch",
    
    ALPHANUMERIC = "specialChar",
    
    USER_CREATED = "userCreated",
    USER_CREATE_FAILED = "userCreatedFail",
    
    USERNAME_TAKEN = "userTaken",
    
    MISSING_FIELD = "missingField",
    
    LOGIN_VALID = "validLogin", 
    LOGIN_FAILED = "failedLogin",
    LOGIN_INVALID = "invalidLogin",

    SERVER_DOWN = "disconnectedServer",

    DISCONNECT = "disconnected",

    ALREADY_CONNECT = "alreadyConnected",

    CORRECT_WORD = "correctWord",
    ROUND_DONE = "roundDone",
    WORD_GUESSED = "wordGuessed",
    END_GAME = "endGame",
    WINNER = "winner",
    NO_WINNER = "draw",
    REPLY = "reply",
    END_SOLO_COOP = "endSoloCoop",

    DISCONNECT_USER = "playerDisconnect"
    
}