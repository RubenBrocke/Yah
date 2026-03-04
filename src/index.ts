import { Scanner } from "./core/scanner.js";

function init(): void {
    const scanner = new Scanner(document.body);
    const astNodes = scanner.scan();
    console.log("Parsed AST Nodes:", astNodes);
}

const Yah = { init };

// For ES module import
// export default Yah;

// For direct browser usage
if (typeof window !== "undefined") {
    (window as any).Yah = Yah;
    init();
}