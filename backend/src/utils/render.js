import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import createDOMPurify from 'isomorphic-dompurify';

export function deltaToSanitizedHTML(delta) {
  if (!delta || typeof delta !== 'object') return '';
  try {
    const ops = Array.isArray(delta.ops) ? delta.ops : [];
    const converter = new QuillDeltaToHtmlConverter(ops, {
      inlineStyles: false,
      multiLineBlockquote: false,
      multiLineCodeblock: false,
      linkTarget: '_blank',
    });
    const dirty = converter.convert();
    const clean = createDOMPurify().sanitize(dirty, { USE_PROFILES: { html: true } });
    return clean;
  } catch (e) {
    return '';
  }
}
