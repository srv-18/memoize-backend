import PDFParser from "pdf2json";

export const textExtractor = async (buffer: Buffer): Promise<string> => {
    try {
        const pdfParser = new PDFParser();

        return new Promise((resolve, reject) => {
            pdfParser.on("pdfParser_dataError", (errData) => {
                reject(errData.parserError);
            });

            pdfParser.on("pdfParser_dataReady", (pdfData) => {
                try {
                    const text = decodeURIComponent(pdfData.Pages.flatMap(page => 
                        page.Texts.map(text => text.R.map(r => r.T).join(' '))
                    ).join(' '));
                    resolve(text);
                } catch(error) {
                    reject(error);
                }

                try {
                    pdfParser.parseBuffer(buffer);
                } catch(e) {
                    reject(e);
                }
            });
        });

    } catch(e) {
        console.log(`Error while extracting text: ${e}`);
        throw new Error("Error while extracting text");
    }
}