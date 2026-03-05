

class YahRequest {
    endpoint: string
    method: string
    params: Record<string, any>

    public async do() {
        const response = await fetch(this.endpoint, {
            method: this.method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(this.params)
        });
        return await response.text()
    }
}