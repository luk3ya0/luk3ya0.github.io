/* global clipboard */
/* eslint-disable no-console */

function addCopyButtons(clipboard) {
    document.querySelectorAll('div.gutter button').forEach((button) => {
	    button.addEventListener('click', () => {
 	        var target = button.parentElement.nextElementSibling.querySelector('pre > code');
            clipboard.writeText(target.innerText).then(
                function() {
                    /* Chrome doesn't seem to blur automatically, leaving the button
                       in a focused state */
                    button.innerText = '✓';
                    setTimeout(function() {
                        button.innerText = '⎘';
                        button.style.color = "var(--primary)";
                    }, 2000);
                },
                function(error) {
                    button.innerText = '✘';
                    console.error(error);
                }
            );
	    });
    });
}

if (navigator && navigator.clipboard) {
    addCopyButtons(navigator.clipboard);
} else {
    var script = document.createElement('script');
    script.src =
        'https://cdnjs.cloudflare.com/ajax/libs/clipboard-polyfill/2.7.0/clipboard-polyfill.promise.js';
    script.integrity = 'sha256-waClS2re9NUbXRsryKoof+F9qc1gjjIhc2eT7ZbIv94=';
    script.crossOrigin = 'anonymous';

    script.onload = function() {
        addCopyButtons(clipboard);
    };

    document.body.appendChild(script);
}
