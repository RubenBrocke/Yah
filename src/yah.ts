function init(): void {
   console.log("Yah initialized") 
}  

const Yah = { init };

// For ES module import
// export default Yah;

// For direct browser usage
if (typeof window !== "undefined") {
    (window as any).Yah = Yah;
    init();
}