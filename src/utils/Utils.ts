export async function svg2png(svgData: URL): Promise<URL> {
    return new Promise((resolve, _reject) => {
        // const img = document.createElement("img");
        const img = new Image();
        const canvas = document.createElement("canvas");

        // Both hidden
        img.style.display = canvas.style.display = "none";

        // document.body.appendChild(img);
        document.body.appendChild(canvas);

        const ctx = canvas.getContext("2d");

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL("image/png");
            // document.body.removeChild(img);
            document.body.removeChild(canvas);

            resolve(new URL(pngUrl));
        };

        img.src = svgData;
    });
}

export const blob2url = (str: string, mimeType: string) =>
    URL.createObjectURL(new Blob([str], { type: mimeType }));
