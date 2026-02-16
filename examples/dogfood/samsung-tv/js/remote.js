// Tizen Remote Control Handler

const KEY = {
    LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40,
    ENTER: 13, RETURN: 10009,
    RED: 403, GREEN: 404, YELLOW: 405, BLUE: 406,
    PLAY: 415, PAUSE: 19, STOP: 413,
    CH_UP: 427, CH_DOWN: 428,
    VOL_UP: 447, VOL_DOWN: 448,
    NUM_0: 48, NUM_1: 49, NUM_2: 50, NUM_3: 51, NUM_4: 52,
    NUM_5: 53, NUM_6: 54, NUM_7: 55, NUM_8: 56, NUM_9: 57
};

class RemoteHandler {
    constructor(callbacks) {
        this.cb = callbacks;
        this.registerKeys();
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    registerKeys() {
        // Tizen API to register keys if needed
        if (window.tizen && tizen.tvinputdevice) {
            const keys = ['Red', 'Green', 'Yellow', 'Blue', 'ChannelUp', 'ChannelDown'];
            keys.forEach(k => {
                try {
                    tizen.tvinputdevice.registerKey(k);
                } catch(e) {}
            });
        }
    }

    onKeyDown(e) {
        // Prevent default behavior for mapped keys
        switch(e.keyCode) {
            case KEY.LEFT: this.cb.onLeft?.(); break;
            case KEY.RIGHT: this.cb.onRight?.(); break;
            case KEY.UP: this.cb.onUp?.(); break;
            case KEY.DOWN: this.cb.onDown?.(); break;
            case KEY.ENTER: this.cb.onEnter?.(); break;
            case KEY.RED: this.cb.onRed?.(); break;
            case KEY.GREEN: this.cb.onGreen?.(); break;
            case KEY.YELLOW: this.cb.onYellow?.(); break;
            case KEY.BLUE: this.cb.onBlue?.(); break;
            case KEY.PLAY: this.cb.onPlay?.(); break;
            case KEY.PAUSE: this.cb.onPause?.(); break;
            case KEY.STOP: this.cb.onStop?.(); break;
            case KEY.CH_UP: this.cb.onChUp?.(); break;
            case KEY.CH_DOWN: this.cb.onChDown?.(); break;
            default: return; // Don't prevent default
        }
        e.preventDefault();
    }
}
