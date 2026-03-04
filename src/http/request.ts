

class YahRequest {
    endpoint: string

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    public async get() {
        const url = window.origin + this.endpoint;
        const response = await fetch(url);
        return response.text();
    }
}