import {html} from 'es6-string-html-template';
import {post, patch, rest_delete} from 'lib/turbolinks/requests';
import throttle from 'lodash.throttle';
import Component from 'lib/ui/component'
import delegate from 'delegate';

import {Annotator} from 'lib/ui/content/annotations/annotator';

import 'lib/ui/content/annotations/elide';
import 'lib/ui/content/annotations/replace';
import 'lib/ui/content/annotations/note';

let annotator = null;

//

document.addEventListener('turbolinks:load', e => {
  if (!document.querySelector('.resource-wrapper') || !isEditable()) {
    annotator && annotator.destroy();
    annotator = null;
    return;
  }

  annotator = new Annotator();
  setAnnotationHandleOffsets();
  makeReplacementsContenteditable();
});

delegate(document, '.annotation-handle .annotation-button', 'click', e => {
  annotator.edit(e.target.parentElement);
});

delegate(document, '.annotate.replacement', 'focus', e => {
  annotator.edit(e.target.previousElementSibling);
});

export function editAnnotationHandle(handle) {
  if (!annotator) { return; }

  annotator.edit(handle);
}

export function stageChangeToAnnotation(handle, attrs) {
  if (!annotator) { return; }

  annotator.edit(handle);
  annotator.changeAnnotation(handle.dataset.annotationId, attrs);
}

export function stagePreviousContent(content) {
  if (!annotator) { return; }

  annotator.previousContent = content;
}

export function isEditable () {
  return document.querySelector('header.casebook').dataset.editable ? true : false;
}

function makeReplacementsContenteditable() {
  let replacements = document.querySelectorAll('.resource-wrapper .annotate.replacement .text');
  for (let el of replacements) { el.contentEditable = true; }
}

document.addEventListener('selectionchange', e => {
  if (!annotator) { return; }

  let selection = document.getSelection();

  let anchorElement = selection.anchorNode && selection.anchorNode.nodeType === document.TEXT_NODE ? selection.anchorNode.parentElement : selection.anchorNode;
  if (!anchorElement || anchorElement.closest('form.create-form')) { return; }

  if (selection.isCollapsed) {
    if (annotator.handle) {
      let parentSpan = selection.anchorNode.parentElement.closest('span');
      if (parentSpan && annotator.handle.dataset.annotationId === parentSpan.dataset.annotationId) {
        return; // selected inside the current annotation, keep it focused
      }
      annotator.deactivate();
    } else {
      annotator.deactivate();
    }
  } else {
    let range = selection.getRangeAt(0);
    annotator.select(range);
  }
});

window.addEventListener('scroll', e => {
  if (annotator && annotator.active) {
    annotator.updateScroll();
  }
});

// After rendering, push over annotation margin handles which land on the same line
function setAnnotationHandleOffsets() {
  let handles = document.querySelectorAll('.annotation-handle');
  let prevRect = null;
  let count = 0;
  for (let handle of handles) {
    let rect = handle.getBoundingClientRect();
    if (prevRect && rect.top === prevRect.top) {
      count += 1;
      handle.style.right = `${-55 - (count * 30)}px`;
      rect = handle.getBoundingClientRect();
    } else {
      count = 0;
      handle.style.right = '-55px';
    }
    prevRect = rect;
  }
}
