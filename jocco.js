/* =====================================================
   SMARTDOC - JAVASCRIPT
===================================================== */


/* ================= GET HTML ELEMENTS ================= */

const fileInput = document.getElementById("fileInput");

const uploadBox = document.getElementById("uploadBox");

const fileSection = document.getElementById("fileSection");

const fileName = document.getElementById("fileName");

const fileSize = document.getElementById("fileSize");

const removeButton = document.getElementById("removeButton");

const analyzeButton = document.getElementById("analyzeButton");

const loadingSection =
    document.getElementById("loadingSection");

const loadingMessage =
    document.getElementById("loadingMessage");

const resultsSection =
    document.getElementById("resultsSection");

const wordCount =
    document.getElementById("wordCount");

const sentenceCount =
    document.getElementById("sentenceCount");

const readingTime =
    document.getElementById("readingTime");

const keywordCount =
    document.getElementById("keywordCount");

const summaryText =
    document.getElementById("summaryText");

const keyPoints =
    document.getElementById("keyPoints");

const keywords =
    document.getElementById("keywords");

const documentType =
    document.getElementById("documentType");

const averageWords =
    document.getElementById("averageWords");

const characterCount =
    document.getElementById("characterCount");

const paragraphCount =
    document.getElementById("paragraphCount");

const originalText =
    document.getElementById("originalText");

const downloadButton =
    document.getElementById("downloadButton");


/* ================= APPLICATION DATA ================= */

let selectedFile = null;

let documentText = "";

let analysisResult = null;


/* ================= FILE SELECTION ================= */

fileInput.addEventListener("change", function () {

    if (this.files.length === 0) {
        return;
    }

    selectFile(this.files[0]);

});


/* ================= DRAG & DROP ================= */

uploadBox.addEventListener("dragover", function (event) {

    event.preventDefault();

    uploadBox.classList.add("dragging");

});


uploadBox.addEventListener("dragleave", function () {

    uploadBox.classList.remove("dragging");

});


uploadBox.addEventListener("drop", function (event) {

    event.preventDefault();

    uploadBox.classList.remove("dragging");

    if (event.dataTransfer.files.length === 0) {
        return;
    }

    selectFile(
        event.dataTransfer.files[0]
    );

});


/* ================= SELECT FILE ================= */

function selectFile(file) {

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    if (extension !== "txt") {

        alert(
            "Please select a TXT file."
        );

        return;

    }


    if (file.size > 5 * 1024 * 1024) {

        alert(
            "File size must be less than 5 MB."
        );

        return;

    }


    selectedFile = file;


    fileName.textContent =
        file.name;


    fileSize.textContent =
        formatFileSize(file.size);


    fileSection.classList.remove(
        "hidden"
    );


    resultsSection.classList.add(
        "hidden"
    );

}


/* ================= REMOVE FILE ================= */

removeButton.addEventListener("click", function () {

    selectedFile = null;

    documentText = "";

    analysisResult = null;

    fileInput.value = "";

    fileSection.classList.add(
        "hidden"
    );

    resultsSection.classList.add(
        "hidden"
    );

});


/* ================= ANALYZE BUTTON ================= */

analyzeButton.addEventListener(
    "click",
    async function () {

        if (!selectedFile) {

            alert(
                "Please choose a TXT file first."
            );

            return;

        }


        analyzeButton.disabled = true;

        loadingSection.classList.remove(
            "hidden"
        );

        resultsSection.classList.add(
            "hidden"
        );


        try {

            loadingMessage.textContent =
                "Reading document...";


            documentText =
                await readTextFile(
                    selectedFile
                );


            documentText =
                cleanText(documentText);


            if (
                documentText.length < 20
            ) {

                throw new Error(
                    "The document contains too little text to analyze."
                );

            }


            loadingMessage.textContent =
                "Finding important information...";


            await wait(400);


            analysisResult =
                analyzeDocument(
                    documentText
                );


            loadingMessage.textContent =
                "Preparing results...";


            await wait(400);


            displayResults(
                analysisResult
            );


            loadingSection.classList.add(
                "hidden"
            );


            resultsSection.classList.remove(
                "hidden"
            );


            resultsSection.scrollIntoView({
                behavior: "smooth"
            });

        }

        catch (error) {

            loadingSection.classList.add(
                "hidden"
            );


            alert(
                "Unable to analyze the document.\n\n" +
                error.message
            );

        }

        finally {

            analyzeButton.disabled = false;

        }

    }
);


/* ================= READ TXT FILE ================= */

function readTextFile(file) {

    return new Promise(
        function (resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    resolve(
                        event.target.result
                    );

                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "Could not read the file."
                        )
                    );

                };


            reader.readAsText(file);

        }
    );

}


/* ================= CLEAN TEXT ================= */

function cleanText(text) {

    return text
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

}


/* ================= ANALYZE DOCUMENT ================= */

function analyzeDocument(text) {

    const words =
        getWords(text);


    const sentences =
        getSentences(text);


    const paragraphs =
        getParagraphs(text);


    const keywordList =
        getKeywords(text);


    const importantSentences =
        getImportantSentences(
            sentences
        );


    const summary =
        createSummary(
            importantSentences,
            text
        );


    const points =
        createKeyPoints(
            importantSentences
        );


    const wordTotal =
        words.length;


    const sentenceTotal =
        sentences.length;


    const average =
        sentenceTotal === 0
            ? 0
            : Math.round(
                wordTotal /
                sentenceTotal
            );


    const minutes =
        Math.max(
            1,
            Math.ceil(
                wordTotal / 200
            )
        );


    return {

        summary: summary,

        keyPoints: points,

        keywords: keywordList,

        words: wordTotal,

        sentences: sentenceTotal,

        minutes: minutes,

        characters: text.length,

        paragraphs: paragraphs.length,

        averageWords: average,

        type: detectDocumentType(text)

    };

}


/* ================= GET WORDS ================= */

function getWords(text) {

    return (
        text.match(
            /\b[\w'-]+\b/g
        ) || []
    );

}


/* ================= GET SENTENCES ================= */

function getSentences(text) {

    return text
        .replace(/\n+/g, " ")
        .split(
            /(?<=[.!?])\s+/
        )
        .map(
            sentence =>
                sentence.trim()
        )
        .filter(
            sentence =>
                sentence.length > 10
        );

}


/* ================= GET PARAGRAPHS ================= */

function getParagraphs(text) {

    return text
        .split(/\n\s*\n/)
        .map(
            paragraph =>
                paragraph.trim()
        )
        .filter(
            paragraph =>
                paragraph.length > 0
        );

}


/* ================= STOP WORDS ================= */

const stopWords = new Set([

    "about",
    "above",
    "after",
    "again",
    "against",
    "also",
    "because",
    "before",
    "being",
    "below",
    "between",
    "both",
    "could",
    "during",
    "each",
    "from",
    "further",
    "have",
    "having",
    "into",
    "itself",
    "more",
    "most",
    "other",
    "over",
    "same",
    "should",
    "some",
    "such",
    "than",
    "that",
    "their",
    "there",
    "these",
    "they",
    "this",
    "those",
    "through",
    "under",
    "until",
    "very",
    "were",
    "which",
    "while",
    "with",
    "would",
    "your",
    "you",
    "will",
    "then",
    "them",
    "when",
    "where",
    "what",
    "who",
    "why",
    "how",
    "been",
    "only",
    "just",
    "many",
    "much",
    "some",
    "any",
    "all",
    "can",
    "may",
    "might",
    "must",
    "not",
    "our",
    "out",
    "for",
    "and",
    "the",
    "are",
    "was",
    "is",
    "in",
    "on",
    "of",
    "to",
    "a",
    "an",
    "as",
    "at",
    "by",
    "or",
    "if",
    "but",
    "do",
    "does",
    "did",
    "be",
    "we",
    "he",
    "she",
    "his",
    "her",
    "its",
    "i",
    "me",
    "my",
    "our",
    "us"

]);


/* ================= GET KEYWORDS ================= */

function getKeywords(text) {

    const words =
        text
            .toLowerCase()
            .match(
                /\b[a-z][a-z'-]{3,}\b/g
            ) || [];


    const frequency = {};


    words.forEach(
        function (word) {

            if (
                stopWords.has(word)
            ) {
                return;
            }


            frequency[word] =
                (frequency[word] || 0) + 1;

        }
    );


    return Object.entries(
        frequency
    )

        .sort(
            (a, b) =>
                b[1] - a[1]
        )

        .slice(0, 12)

        .map(
            item =>
                item[0]
        );

}


/* ================= IMPORTANT SENTENCES ================= */

function getImportantSentences(
    sentences
) {

    const importantWords = [

        "important",
        "main",
        "key",
        "purpose",
        "objective",
        "goal",
        "result",
        "problem",
        "solution",
        "decision",
        "required",
        "recommend",
        "recommended",
        "need",
        "needs",
        "must",
        "should",
        "because",
        "therefore",
        "conclusion",
        "finally",
        "project",
        "meeting",
        "deadline"

    ];


    const scored =
        sentences.map(
            function (sentence, index) {

                const lower =
                    sentence.toLowerCase();


                let score = 0;


                importantWords.forEach(
                    function (word) {

                        if (
                            lower.includes(word)
                        ) {

                            score += 2;

                        }

                    }
                );


                const words =
                    getWords(sentence);


                if (
                    words.length >= 10 &&
                    words.length <= 35
                ) {

                    score += 1;

                }


                if (
                    index === 0
                ) {

                    score += 3;

                }


                return {

                    sentence: sentence,

                    score: score,

                    index: index

                };

            }
        );


    return scored

        .sort(
            (a, b) =>
                b.score - a.score
        )

        .slice(
            0,
            6
        )

        .sort(
            (a, b) =>
                a.index - b.index
        )

        .map(
            item =>
                item.sentence
        );

}


/* ================= CREATE SUMMARY ================= */

function createSummary(
    importantSentences,
    originalText
) {

    let selected =
        importantSentences
            .slice(0, 3)
            .join(" ");


    if (!selected) {

        selected =
            originalText;

    }


    const words =
        getWords(selected);


    if (
        words.length > 100
    ) {

        selected =
            words
                .slice(0, 100)
                .join(" ") +
            "...";

    }


    return selected;

}


/* ================= KEY POINTS ================= */

function createKeyPoints(
    sentences
) {

    const result = [];


    sentences.forEach(
        function (sentence) {

            if (
                !result.includes(sentence)
            ) {

                result.push(sentence);

            }

        }
    );


    return result.slice(
        0,
        6
    );

}


/* ================= DOCUMENT TYPE ================= */

function detectDocumentType(text) {

    const lower =
        text.toLowerCase();


    if (
        lower.includes("meeting") ||
        lower.includes("agenda") ||
        lower.includes("discussion")
    ) {

        return "Meeting Notes";

    }


    if (
        lower.includes("research") ||
        lower.includes("abstract") ||
        lower.includes("methodology")
    ) {

        return "Research Document";

    }


    if (
        lower.includes("project") ||
        lower.includes("deadline") ||
        lower.includes("milestone")
    ) {

        return "Project Document";

    }


    if (
        lower.includes("report") ||
        lower.includes("findings") ||
        lower.includes("analysis")
    ) {

        return "Report";

    }


    if (
        lower.includes("invoice") ||
        lower.includes("amount due")
    ) {

        return "Invoice";

    }


    return "General Text Document";

}


/* ================= DISPLAY RESULTS ================= */

function displayResults(result) {

    wordCount.textContent =
        result.words.toLocaleString();


    sentenceCount.textContent =
        result.sentences.toLocaleString();


    readingTime.textContent =
        result.minutes +
        (
            result.minutes === 1
                ? " min"
                : " mins"
        );


    keywordCount.textContent =
        result.keywords.length;


    summaryText.textContent =
        result.summary;


    documentType.textContent =
        result.type;


    averageWords.textContent =
        result.averageWords;


    characterCount.textContent =
        result.characters.toLocaleString();


    paragraphCount.textContent =
        result.paragraphs;


    originalText.textContent =
        documentText;


    /* ---------- KEY POINTS ---------- */

    keyPoints.innerHTML = "";


    result.keyPoints.forEach(
        function (point) {

            const element =
                document.createElement("div");


            element.className =
                "key-point";


            element.textContent =
                point;


            keyPoints.appendChild(
                element
            );

        }
    );


    /* ---------- KEYWORDS ---------- */

    keywords.innerHTML = "";


    result.keywords.forEach(
        function (word) {

            const element =
                document.createElement("span");


            element.className =
                "keyword";


            element.textContent =
                word;


            keywords.appendChild(
                element
            );

        }
    );

}


/* ================= DOWNLOAD REPORT ================= */

downloadButton.addEventListener(
    "click",
    function () {

        if (!analysisResult) {

            return;

        }


        const report =

`SMARTDOC
DOCUMENT ANALYSIS REPORT
========================================

FILE
${selectedFile.name}


DOCUMENT TYPE
${analysisResult.type}


SUMMARY
========================================

${analysisResult.summary}


KEY POINTS
========================================

${analysisResult.keyPoints
    .map(
        (point, index) =>
            `${index + 1}. ${point}`
    )
    .join("\n")}


KEYWORDS
========================================

${analysisResult.keywords.join(", ")}


STATISTICS
========================================

Words: ${analysisResult.words}
Sentences: ${analysisResult.sentences}
Reading Time: ${analysisResult.minutes} minute(s)
Average Words / Sentence: ${analysisResult.averageWords}
Characters: ${analysisResult.characters}
Paragraphs: ${analysisResult.paragraphs}


ORIGINAL TEXT
========================================

${documentText}


========================================
Generated by SmartDoc
`;


        const blob =
            new Blob(
                [report],
                {
                    type:
                        "text/plain;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href =
            url;


        link.download =
            "SmartDoc-Report.txt";


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        URL.revokeObjectURL(
            url
        );

    }
);


/* ================= FILE SIZE ================= */

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " Bytes";

    }


    if (bytes < 1024 * 1024) {

        return (
            (bytes / 1024).toFixed(1) +
            " KB"
        );

    }


    return (
        (bytes / (1024 * 1024)).toFixed(1) +
        " MB"
    );

}


/* ================= WAIT ================= */

function wait(milliseconds) {

    return new Promise(
        function (resolve) {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}
/* =====================================================
   ABOUT SECTION
===================================================== */

const aboutButton =
    document.getElementById("aboutButton");

const aboutModal =
    document.getElementById("aboutModal");

const closeAbout =
    document.getElementById("closeAbout");

const aboutOverlay =
    document.querySelector(".about-overlay");


/* ================= OPEN ABOUT ================= */

aboutButton.addEventListener(
    "click",
    function () {

        aboutModal.classList.remove(
            "hidden"
        );

        document.body.style.overflow =
            "hidden";

    }
);


/* ================= CLOSE ABOUT ================= */

closeAbout.addEventListener(
    "click",
    closeAboutModal
);


aboutOverlay.addEventListener(
    "click",
    closeAboutModal
);


/* ================= ESC KEY ================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            !aboutModal.classList.contains(
                "hidden"
            )
        ) {

            closeAboutModal();

        }

    }
);


/* ================= CLOSE FUNCTION ================= */

function closeAboutModal() {

    aboutModal.classList.add(
        "hidden"
    );

    document.body.style.overflow =
        "";

}