export class SSEListener {
    constructor(endpoint, onMessage) {
        this.onMessage = onMessage;
        this.endpoint = endpoint;
        this.eventSource = this.open();
        document.addEventListener("visibilitychange", () => {
            if (document.hidden)
                this.close();
            else
                this.open();
        });
    }
    close() {
        this.eventSource.close();
        console.log(this.endpoint + " connection is closed");
    }
    open() {
        if (!window.EventSource) {
            alert("The browser does not support Server-Sent Events");
            throw new Error("The browser does not support Server-Sent Events");
        }
        this.eventSource = new EventSource("/ctw/status/sse/" + this.endpoint);
        this.eventSource.onopen = () => {
            console.log(this.endpoint + " connection is established");
        };
        this.eventSource.onerror = (error) => {
            console.log(this.endpoint + " connection state: " + this.eventSource.readyState + ", error: " + event);
        };
        this.eventSource.onmessage = this.onMessage;
        return this.eventSource;
    }
}
