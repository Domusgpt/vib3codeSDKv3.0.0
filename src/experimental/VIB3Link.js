/**
 * VIB3Link - Multi-User Synchronization
 *
 * Provides a networking layer (mocked for now) to sync VIB3Universe state
 * between multiple clients. Handles entity updates, parameter deltas, and events.
 *
 * @experimental
 */
export class VIB3Link {
    constructor() {
        this.connected = false;
        this.roomId = null;
        this.isHost = false;
        this.peers = new Set();
        this.eventBus = new EventTarget();

        // Bind methods
        this.handleMessage = this.handleMessage.bind(this);
    }

    /**
     * Connect to a shared room.
     * @param {string} roomId
     */
    async connect(roomId) {
        this.roomId = roomId;
        this.connected = true;

        // Mock connection logic
        console.log(`VIB3Link: Connected to room ${roomId}`);

        // In a real implementation, we would establish WebRTC/WebSocket here
        // and negotiate host status. For now, assume single-player or host.
        this.isHost = true;

        this.emit('connected', { roomId, isHost: this.isHost });
    }

    /**
     * Disconnect from the room.
     */
    disconnect() {
        this.connected = false;
        this.peers.clear();
        console.log(`VIB3Link: Disconnected.`);
        this.emit('disconnected', {});
    }

    /**
     * Broadcast an event to all peers.
     * @param {string} type - Message type (upd, prm, evt)
     * @param {object} payload
     */
    broadcast(type, payload) {
        if (!this.connected) return;

        const message = {
            t: type,
            s: Date.now(), // simple sequence
            p: payload
        };

        // In real impl: webrtcChannel.send(JSON.stringify(message));

        // Mock loopback for local testing (optional)
        // this.handleMessage(message);
    }

    /**
     * Handle an incoming message from the network.
     * @param {object} message
     */
    handleMessage(message) {
        const { t, p } = message;

        switch (t) {
            case 'upd':
                this.emit('entityUpdate', p);
                break;
            case 'prm':
                this.emit('parameterDelta', p);
                break;
            case 'evt':
                this.emit('universeEvent', p);
                break;
            default:
                console.warn(`VIB3Link: Unknown message type ${t}`);
        }
    }

    /**
     * Sync the state of all entities. Called by Orchestrator tick.
     * @param {Map<string, object>} entities
     */
    sync(entities) {
        if (!this.connected || !this.isHost) return;

        // Collect dirty state
        // In a real optimized system, we'd diff state or only send moved entities
        // For now, let's just log that we would sync
        // console.log(`VIB3Link: Syncing ${entities.size} entities`);
    }

    /**
     * Emit a local event for system consumption.
     * @param {string} name
     * @param {object} detail
     */
    emit(name, detail) {
        const event = new CustomEvent(name, { detail });
        this.eventBus.dispatchEvent(event);
    }

    /**
     * Listen for network events.
     * @param {string} name
     * @param {function} callback
     */
    on(name, callback) {
        this.eventBus.addEventListener(name, (e) => callback(e.detail));
    }
}
