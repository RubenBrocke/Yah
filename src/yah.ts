import { Scannner } from "./dom/scanner";

function init(): void {
    const scanner = new Scannner();
    const components = scanner.scan(globalThis.document.body);
    console.log("Yah initialized " + components.length + " components."); 
}  

const Yah = { init };

// For ES module import
// export default Yah;

// For direct browser usage
if (typeof window !== "undefined") {
    (window as any).Yah = Yah;
    init();
}