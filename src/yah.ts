import { Scanner } from "./dom/scanner";
import * as Mustache from "mustache"

function init(): void {
    const scanner = new Scanner();
    const components = scanner.scan(globalThis.document.body).then(components => {
        console.log("Yah initialized " + components.length + " components."); 
        console.log(components)
    });
}  

const Yah = { init };

// For ES module import
// export default Yah;

// For direct browser usage
if (typeof window !== "undefined") {
    (window as any).Yah = Yah;
    init();
}