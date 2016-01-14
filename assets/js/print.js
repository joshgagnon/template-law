import '../print-styles.scss';

import pagify from './pagify';



document.addEventListener("DOMContentLoaded", function(event) {
    pagify(document.getElementsByClassName('document')[0]);
});