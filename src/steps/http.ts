import { Component } from "../core/component"


export class HTTPStep {
    method: string
    endpoint: string

    constructor(method: string, endpoint: string) {
        this.method = method
        this.endpoint = endpoint
    }

    public async execute(host: Component): Promise<any> {
        const options: RequestInit = {
            method: this.method
        }

        if (this.method.toLocaleLowerCase() == "post") {
            // Include parameters
            if (host.element instanceof HTMLFormElement) {
                const formData = new FormData(host.element)
                const dataObj: Record<string, any> = {};

                formData.forEach((value, key) => {
                    // handle multiple entries for the same key as an array
                    if (dataObj[key] !== undefined) {
                        if (!Array.isArray(dataObj[key])) dataObj[key] = [dataObj[key]];
                        dataObj[key].push(value);
                    } else {
                        dataObj[key] = value;
                    }
                });

                // Set JSON body
                options.body = JSON.stringify(dataObj);
            }
        }

        const response = await fetch(this.endpoint, options)
        return response.json()
    }
}