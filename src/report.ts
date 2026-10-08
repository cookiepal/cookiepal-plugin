import type { Assessment, Finding } from './assess.ts';

/**
 * Renders the risk read as a self-contained page, so the check can be published
 * as an artifact instead of read as terminal text (CPL-396).
 *
 * The page is built here, in Node, from the assessment: every sentence about a
 * law comes from `laws.ts`, and nothing is written by a model. That is the
 * point of rendering it rather than describing it — a page a model composes
 * could paraphrase legal wording that was reviewed as fixed text.
 *
 * It is one file with no external request in it. The artifact viewer's content
 * policy blocks external images, stylesheets and fetches, so the logo lockups
 * are inline SVG and the CSS is inline; only the typefaces come from Google
 * Fonts, which the policy does allow, and each has a real fallback stack. The artifact
 * publisher wraps the file in its own document skeleton, so this is a fragment:
 * no doctype, html, head or body tags of its own.
 */

/**
 * CookiePal's logo, as two lockups the brand ships: the black one for a
 * light ground and the white one for a dark ground. Both are inlined and
 * the stylesheet shows one, because the artifact's policy blocks external
 * images and a theme cannot be known at render time. These are the same two
 * files as `assets/logo.svg` and `assets/logo-dark.svg`, and a test holds the
 * copies together.
 */
const LOGO_LIGHT =
  '<svg class="logo logo-light" width="824" height="164" role="img" aria-label="CookiePal" viewBox="0 0 824 164" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<g clip-path="url(#clip0_5460_35912)">' +
  '<path d="M127.577 18.7524L123.745 44.4768C117.88 38.3796 111.55 33.7922 104.756 30.8307C97.9042 27.8692 90.4714 26.3594 82.458 26.3594C74.4445 26.3594 66.6052 27.8111 59.5209 30.6565C52.4946 33.5019 46.5135 37.6247 41.5777 42.967C35.7127 49.2385 31.2414 56.3809 28.1638 64.5686C25.0281 72.6982 23.4602 81.1181 23.4602 89.8284C23.4602 105.333 28.2219 117.992 37.7451 127.747C47.2684 137.503 59.5789 142.381 74.6768 142.381C82.2257 142.381 89.4843 141.103 96.4525 138.49C103.421 135.877 110.157 131.986 116.66 126.876L111.434 155.736C104.582 158.407 97.9623 160.44 91.6909 161.775C85.4195 163.111 79.3223 163.808 73.4573 163.808C51.4493 163.808 33.7384 157.072 20.2665 143.658C6.79456 130.244 0.0585938 112.591 0.0585938 90.7575C0.0585938 78.6792 2.20713 67.1817 6.50421 56.3228C10.8013 45.464 16.8985 36.0569 24.7958 28.1595C32.1125 20.7848 40.5324 15.2102 49.9976 11.3777C59.4628 7.54517 69.6248 5.62891 80.4836 5.62891C90.2392 5.62891 99.0075 6.73221 106.789 8.93882C114.57 11.1454 121.538 14.4553 127.635 18.9266L127.577 18.7524Z" fill="#141525"/>' +
  '<mask id="path-2-inside-1_5460_35912" fill="white">' +
  '<path d="M170.832 63.8994C170.672 64.768 170.588 65.6633 170.588 66.5781C170.588 74.6998 177.172 81.2839 185.294 81.2842C188.605 81.2841 191.659 80.1891 194.117 78.3428C194.117 86.4645 200.702 93.0486 208.823 93.0488C209.964 93.0488 211.074 92.9185 212.14 92.6729C211.894 93.7387 211.765 94.8498 211.765 95.9902C211.765 102.018 215.393 107.197 220.583 109.468C220.584 109.875 220.588 110.285 220.588 110.696C220.588 126.304 219.22 138.48 209.127 148.518C199.034 158.555 186.017 163.574 170.188 163.574C156.07 163.574 144.763 159.438 136.27 151.165C127.776 142.892 126.471 133.253 126.471 119.52C126.471 103.47 128.493 89.0075 138.421 78.8594C147.047 70.0414 157.839 65.0552 170.832 63.8994Z"/>' +
  '</mask>' +
  '<path d="M170.832 63.8994C170.672 64.768 170.588 65.6633 170.588 66.5781C170.588 74.6998 177.172 81.2839 185.294 81.2842C188.605 81.2841 191.659 80.1891 194.117 78.3428C194.117 86.4645 200.702 93.0486 208.823 93.0488C209.964 93.0488 211.074 92.9185 212.14 92.6729C211.894 93.7387 211.765 94.8498 211.765 95.9902C211.765 102.018 215.393 107.197 220.583 109.468C220.584 109.875 220.588 110.285 220.588 110.696C220.588 126.304 219.22 138.48 209.127 148.518C199.034 158.555 186.017 163.574 170.188 163.574C156.07 163.574 144.763 159.438 136.27 151.165C127.776 142.892 126.471 133.253 126.471 119.52C126.471 103.47 128.493 89.0075 138.421 78.8594C147.047 70.0414 157.839 65.0552 170.832 63.8994Z" fill="#EF8600"/>' +
  '<path d="M170.832 63.8994L171.989 64.1124L172.269 62.5905L170.728 62.7276L170.832 63.8994ZM170.588 66.5781L169.411 66.5781V66.5781H170.588ZM185.294 81.2842L185.294 82.4606H185.294L185.294 81.2842ZM194.117 78.3428H195.294V75.9876L193.411 77.4021L194.117 78.3428ZM208.823 93.0488L208.823 94.2253H208.823V93.0488ZM212.14 92.6729L213.286 92.9371L213.709 91.1039L211.875 91.5264L212.14 92.6729ZM211.765 95.9902L210.588 95.9902V95.9903L211.765 95.9902ZM220.583 109.468L221.759 109.464L221.757 108.697L221.055 108.39L220.583 109.468ZM220.588 110.696H221.764V110.696H220.588ZM209.127 148.518L209.957 149.352V149.352L209.127 148.518ZM170.188 163.574L170.188 164.751H170.188V163.574ZM136.27 151.165L135.449 152.008V152.008L136.27 151.165ZM126.471 119.52H125.294V119.52H126.471ZM138.421 78.8594L137.58 78.0367L137.58 78.0367L138.421 78.8594ZM170.832 63.8994L169.675 63.6864C169.502 64.6244 169.411 65.5909 169.411 66.5781L170.588 66.5781L171.764 66.5782C171.764 65.7357 171.842 64.9116 171.989 64.1124L170.832 63.8994ZM170.588 66.5781H169.411C169.411 75.3496 176.523 82.4604 185.294 82.4606L185.294 81.2842L185.294 80.1077C177.822 80.1075 171.764 74.05 171.764 66.5781H170.588ZM185.294 81.2842L185.294 82.4606C188.869 82.4606 192.169 81.2774 194.824 79.2834L194.117 78.3428L193.411 77.4021C191.149 79.1009 188.341 80.1077 185.294 80.1077L185.294 81.2842ZM194.117 78.3428H192.941C192.941 87.1142 200.052 94.225 208.823 94.2253L208.823 93.0488L208.823 91.8724C201.351 91.8721 195.294 85.8147 195.294 78.3428H194.117ZM208.823 93.0488V94.2253C210.054 94.2253 211.252 94.0847 212.404 93.8193L212.14 92.6729L211.875 91.5264C210.895 91.7523 209.874 91.8724 208.823 91.8724V93.0488ZM212.14 92.6729L210.993 92.4086C210.728 93.561 210.588 94.7607 210.588 95.9902L211.765 95.9902L212.941 95.9903C212.941 94.9389 213.06 93.9164 213.286 92.9371L212.14 92.6729ZM211.765 95.9902L210.588 95.9903C210.588 102.502 214.509 108.095 220.111 110.546L220.583 109.468L221.055 108.39C216.277 106.3 212.941 101.534 212.941 95.9902L211.765 95.9902ZM220.583 109.468L219.407 109.471C219.408 109.891 219.411 110.285 219.411 110.696H220.588H221.764C221.764 110.285 221.761 109.86 221.759 109.464L220.583 109.468ZM220.588 110.696H219.411C219.411 126.275 218.026 138.008 208.297 147.683L209.127 148.518L209.957 149.352C220.414 138.952 221.764 126.334 221.764 110.696H220.588ZM209.127 148.518L208.297 147.683C198.451 157.476 185.746 162.398 170.188 162.398V163.574V164.751C186.289 164.751 199.617 159.635 209.957 149.352L209.127 148.518ZM170.188 163.574L170.188 162.398C156.314 162.398 145.323 158.341 137.09 150.322L136.27 151.165L135.449 152.008C144.203 160.535 155.825 164.751 170.188 164.751L170.188 163.574ZM136.27 151.165L137.09 150.322C128.963 142.406 127.647 133.204 127.647 119.52H126.471H125.294C125.294 133.301 126.589 143.378 135.449 152.008L136.27 151.165ZM126.471 119.52H127.647C127.647 103.503 129.686 89.4712 139.262 79.6821L138.421 78.8594L137.58 78.0367C127.301 88.5437 125.294 103.437 125.294 119.52H126.471ZM138.421 78.8594L139.262 79.6821C147.68 71.0764 158.205 66.2037 170.936 65.0713L170.832 63.8994L170.728 62.7276C157.472 63.9067 146.414 69.0064 137.58 78.0367L138.421 78.8594Z" fill="#141525" mask="url(#path-2-inside-1_5460_35912)"/>' +
  '<circle cx="152.941" cy="93.0469" r="11.7647" fill="#141525"/>' +
  '<circle cx="194.118" cy="51.8706" r="5.29412" fill="#EF8600" stroke="#141525" stroke-width="1.17647"/>' +
  '<circle cx="223.53" cy="45.9888" r="5.29412" fill="#EF8600" stroke="#141525" stroke-width="1.17647"/>' +
  '<circle cx="220.588" cy="72.4593" r="8.23529" fill="#EF8600" stroke="#141525" stroke-width="1.17647"/>' +
  '<path d="M155.882 134.224C155.882 139.097 151.932 143.047 147.059 143.047C142.186 143.047 138.235 139.097 138.235 134.224C138.235 129.351 142.186 125.4 147.059 125.4C151.932 125.4 155.882 129.351 155.882 134.224Z" fill="#141525"/>' +
  '<path d="M211.765 119.519C211.765 124.392 207.814 128.342 202.941 128.342C198.068 128.342 194.118 124.392 194.118 119.519C194.118 114.646 198.068 110.695 202.941 110.695C207.814 110.695 211.765 114.646 211.765 119.519Z" fill="#141525"/>' +
  '<path d="M188.235 145.989C188.235 149.238 185.602 151.871 182.353 151.871C179.104 151.871 176.471 149.238 176.471 145.989C176.471 142.74 179.104 140.106 182.353 140.106C185.602 140.106 188.235 142.74 188.235 145.989Z" fill="#141525"/>' +
  '<path d="M286.395 58.4209C301.55 58.4209 313.687 62.8922 322.746 71.7767C331.804 80.6612 336.334 92.5072 336.334 107.373C336.334 123.806 330.991 137.278 320.365 147.847C309.738 158.415 296.034 163.699 279.368 163.699C264.445 163.699 252.541 159.344 243.656 150.634C234.713 141.924 230.242 130.31 230.242 115.851C230.242 98.9528 235.468 85.1905 245.921 74.5059C256.373 63.8213 269.845 58.479 286.395 58.479V58.4209ZM286.627 77.932C276.813 77.932 268.8 81.4741 262.586 88.5585C256.373 95.6429 253.295 104.702 253.295 115.735C253.295 124.503 255.618 131.413 260.322 136.407C264.967 141.401 271.355 143.898 279.484 143.898C289.704 143.898 297.892 140.53 304.047 133.794C310.203 127.058 313.28 117.999 313.28 106.618C313.28 97.5011 310.958 90.4167 306.312 85.4228C301.667 80.4289 295.163 77.932 286.685 77.932H286.627Z" fill="#141525"/>' +
  '<path d="M339.47 159.631L360.549 0H382.673L368.969 103.478L418.501 61.9592H447.245L393.88 106.846L435.399 159.573H408.629L368.562 107.659L361.536 159.573H339.412L339.47 159.631Z" fill="#141525"/>' +
  '<path d="M438.128 159.634L451.019 62.0203H473.143L460.252 159.634H438.128ZM452.761 27.8178C452.761 24.1595 454.039 21.0819 456.652 18.5269C459.265 15.9718 462.343 14.6943 466.059 14.6943C469.775 14.6943 472.853 15.9718 475.408 18.4688C477.905 20.9657 479.182 24.1015 479.182 27.7598C479.182 31.4181 477.905 34.6699 475.408 37.225C472.911 39.78 469.775 41.0575 466.059 41.0575C462.343 41.0575 459.033 39.78 456.536 37.225C454.039 34.6699 452.761 31.5342 452.761 27.7598V27.8178Z" fill="#141525"/>' +
  '<path d="M551.653 129.669L567.622 142.154C561.931 149.645 555.776 155.103 549.098 158.529C542.42 161.955 534.755 163.698 526.103 163.698C511.585 163.698 499.914 159.342 490.971 150.574C482.028 141.806 477.615 130.308 477.615 116.023C477.615 99.2994 482.725 85.5371 493.003 74.7944C503.282 64.0517 516.347 58.6514 532.2 58.6514C545.439 58.6514 556.008 62.7742 563.847 70.9619C571.686 79.1496 575.635 90.1826 575.635 103.945C575.635 105.106 575.635 106.616 575.461 108.416C575.345 110.216 575.229 112.423 574.996 114.978H500.552C500.552 123.862 502.759 130.889 507.23 136.115C511.702 141.341 517.625 144.012 525.057 144.012C530.225 144.012 535.103 142.735 539.749 140.238C544.394 137.741 548.343 134.199 551.653 129.669ZM502.527 99.0671H552.872C552.64 92.4473 550.608 87.2792 546.717 83.4467C542.826 79.6141 537.658 77.7559 531.096 77.7559C523.664 77.7559 517.392 79.6722 512.224 83.5047C507.056 87.3373 503.804 92.5054 502.469 99.0671H502.527Z" fill="#141525"/>' +
  '<path d="M604.96 159.626H581.384L601.186 8.87988H632.369C644.389 8.87988 653.041 9.57671 658.325 10.9123C663.609 12.3059 668.313 14.6287 672.436 17.9386C676.965 21.4808 680.449 25.9521 682.83 31.2944C685.211 36.6367 686.43 42.5597 686.43 49.1795C686.43 56.9607 685.037 63.8709 682.249 70.0262C679.462 76.1814 675.455 81.2915 670.171 85.4143C665.642 89.0146 660.3 91.5116 654.202 93.0213C648.105 94.5311 638.64 95.286 625.865 95.286H613.38L604.96 159.626ZM616.225 73.7425H624.181C638.988 73.7425 649.092 72.0005 654.493 68.4583C659.893 64.9161 662.564 58.8189 662.564 50.1667C662.564 42.9081 660.3 37.7981 655.77 34.8366C651.241 31.8751 642.472 30.4233 629.523 30.4233H621.916L616.225 73.8006V73.7425Z" fill="#EF8600"/>' +
  '<path d="M762.326 159.633H740.202L741.828 148.948C737.995 153.826 733.582 157.484 728.53 159.865C723.536 162.246 717.729 163.465 711.226 163.465C698.451 163.465 688.579 159.459 681.611 151.387C674.643 143.315 671.158 131.876 671.158 117.068C671.158 99.5317 675.397 85.4791 683.934 74.7364C692.47 63.9937 703.619 58.6514 717.381 58.6514C723.885 58.6514 729.982 59.9869 735.557 62.7162C741.131 65.4454 746.299 69.5683 751.061 75.1429L753.035 62.0774H775.159L762.268 159.691L762.326 159.633ZM694.154 113.875C694.154 123.224 696.302 130.482 700.657 135.708C705.012 140.935 710.994 143.548 718.659 143.548C727.543 143.548 734.511 140.006 739.679 132.921C744.848 125.837 747.403 116.081 747.403 103.655C747.403 95.2346 745.08 88.4986 740.492 83.5047C735.905 78.5108 729.692 76.0139 721.852 76.0139C713.432 76.0139 706.696 79.4399 701.644 86.234C696.651 93.028 694.154 102.203 694.154 113.817V113.875Z" fill="#EF8600"/>' +
  '<path d="M802.625 159.631H780.5L801.405 0H823.529L802.625 159.631Z" fill="#EF8600"/></g><defs>' +
  '<clipPath id="clip0_5460_35912"><rect width="823.529" height="163.637" fill="white"/></clipPath></defs></svg>';

const LOGO_DARK =
  '<svg class="logo logo-dark" width="824" height="164" role="img" aria-label="CookiePal" viewBox="0 0 824 164" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<g clip-path="url(#clip0_3964_35164)">' +
  '<path d="M127.577 18.7524L123.745 44.4768C117.88 38.3796 111.55 33.7922 104.756 30.8307C97.9041 27.8692 90.4713 26.3594 82.4579 26.3594C74.4444 26.3594 66.6051 27.8111 59.5208 30.6565C52.4944 33.5019 46.5134 37.6247 41.5775 42.967C35.7126 49.2385 31.2413 56.3809 28.1637 64.5686C25.028 72.6982 23.4601 81.1181 23.4601 89.8284C23.4601 105.333 28.2218 117.992 37.745 127.747C47.2683 137.503 59.5788 142.381 74.6767 142.381C82.2256 142.381 89.4842 141.103 96.4524 138.49C103.421 135.877 110.157 131.986 116.66 126.876L111.434 155.736C104.582 158.407 97.9622 160.44 91.6908 161.775C85.4194 163.111 79.3222 163.808 73.4572 163.808C51.4492 163.808 33.7383 157.072 20.2664 143.658C6.79443 130.244 0.0584717 112.591 0.0584717 90.7575C0.0584717 78.6792 2.20701 67.1817 6.50409 56.3228C10.8012 45.464 16.8984 36.0569 24.7957 28.1595C32.1124 20.7848 40.5323 15.2102 49.9975 11.3777C59.4627 7.54517 69.6247 5.62891 80.4835 5.62891C90.2391 5.62891 99.0074 6.73221 106.789 8.93882C114.57 11.1454 121.538 14.4553 127.635 18.9266L127.577 18.7524Z" fill="white"/>' +
  '<mask id="path-2-inside-1_3964_35164" fill="white">' +
  '<path d="M170.832 63.8994C170.672 64.7677 170.588 65.6626 170.588 66.5771C170.588 74.6988 177.172 81.283 185.294 81.2832C188.604 81.2832 191.659 80.1881 194.117 78.3418C194.117 86.4635 200.701 93.0476 208.823 93.0479C209.963 93.0478 211.074 92.9175 212.139 92.6719C211.894 93.7378 211.764 94.8487 211.764 95.9893C211.764 102.017 215.392 107.197 220.583 109.468C220.584 109.875 220.588 110.284 220.588 110.695C220.588 126.303 219.22 138.479 209.127 148.517C199.034 158.554 186.017 163.573 170.188 163.573C156.069 163.573 144.763 159.437 136.269 151.164C127.776 142.891 126.47 133.252 126.47 119.519C126.47 103.469 128.493 89.0065 138.421 78.8584C147.047 70.0405 157.839 65.0552 170.832 63.8994Z"/>' +
  '</mask>' +
  '<path d="M170.832 63.8994C170.672 64.7677 170.588 65.6626 170.588 66.5771C170.588 74.6988 177.172 81.283 185.294 81.2832C188.604 81.2832 191.659 80.1881 194.117 78.3418C194.117 86.4635 200.701 93.0476 208.823 93.0479C209.963 93.0478 211.074 92.9175 212.139 92.6719C211.894 93.7378 211.764 94.8487 211.764 95.9893C211.764 102.017 215.392 107.197 220.583 109.468C220.584 109.875 220.588 110.284 220.588 110.695C220.588 126.303 219.22 138.479 209.127 148.517C199.034 158.554 186.017 163.573 170.188 163.573C156.069 163.573 144.763 159.437 136.269 151.164C127.776 142.891 126.47 133.252 126.47 119.519C126.47 103.469 128.493 89.0065 138.421 78.8584C147.047 70.0405 157.839 65.0552 170.832 63.8994Z" fill="#EF8600"/>' +
  '<path d="M170.832 63.8994L171.989 64.1123L172.269 62.5905L170.728 62.7276L170.832 63.8994ZM170.588 66.5771L169.411 66.5771V66.5771H170.588ZM185.294 81.2832L185.294 82.4597H185.294L185.294 81.2832ZM194.117 78.3418H195.293V75.9866L193.41 77.4012L194.117 78.3418ZM208.823 93.0479L208.823 94.2243H208.823V93.0479ZM212.139 92.6719L213.286 92.9362L213.708 91.1029L211.875 91.5255L212.139 92.6719ZM211.764 95.9893L210.588 95.9892V95.9893L211.764 95.9893ZM220.583 109.468L221.759 109.464L221.757 108.697L221.054 108.39L220.583 109.468ZM220.588 110.695H221.764V110.695H220.588ZM209.127 148.517L209.956 149.351V149.351L209.127 148.517ZM170.188 163.573L170.188 164.75H170.188V163.573ZM136.269 151.164L135.448 152.007H135.448L136.269 151.164ZM126.47 119.519H125.294V119.519H126.47ZM138.421 78.8584L137.58 78.0357L137.58 78.0357L138.421 78.8584ZM170.832 63.8994L169.675 63.6865C169.502 64.624 169.411 65.5901 169.411 66.5771L170.588 66.5771L171.764 66.5772C171.764 65.7352 171.842 64.9115 171.989 64.1123L170.832 63.8994ZM170.588 66.5771H169.411C169.411 75.3486 176.522 82.4594 185.294 82.4597L185.294 81.2832L185.294 80.1067C177.822 80.1065 171.764 74.0491 171.764 66.5771H170.588ZM185.294 81.2832L185.294 82.4597C188.868 82.4596 192.169 81.2763 194.824 79.2824L194.117 78.3418L193.41 77.4012C191.149 79.0998 188.341 80.1067 185.294 80.1067L185.294 81.2832ZM194.117 78.3418H192.94C192.94 87.1133 200.052 94.2241 208.823 94.2243L208.823 93.0479L208.823 91.8714C201.351 91.8712 195.293 85.8137 195.293 78.3418H194.117ZM208.823 93.0479V94.2243C210.053 94.2243 211.252 94.0837 212.404 93.8183L212.139 92.6719L211.875 91.5255C210.895 91.7513 209.873 91.8714 208.823 91.8714V93.0479ZM212.139 92.6719L210.993 92.4076C210.727 93.5601 210.588 94.7596 210.588 95.9892L211.764 95.9893L212.941 95.9893C212.941 94.9378 213.06 93.9156 213.286 92.9362L212.139 92.6719ZM211.764 95.9893L210.588 95.9893C210.588 102.501 214.508 108.094 220.111 110.546L220.583 109.468L221.054 108.39C216.276 106.3 212.941 101.533 212.941 95.9892L211.764 95.9893ZM220.583 109.468L219.406 109.471C219.408 109.891 219.411 110.284 219.411 110.695H220.588H221.764C221.764 110.285 221.76 109.859 221.759 109.464L220.583 109.468ZM220.588 110.695H219.411C219.411 126.274 218.026 138.007 208.297 147.682L209.127 148.517L209.956 149.351C220.413 138.951 221.764 126.333 221.764 110.695H220.588ZM209.127 148.517L208.297 147.682C198.451 157.475 185.746 162.397 170.188 162.397V163.573V164.75C186.289 164.75 199.616 159.634 209.956 149.351L209.127 148.517ZM170.188 163.573L170.188 162.397C156.313 162.397 145.323 158.34 137.09 150.321L136.269 151.164L135.448 152.007C144.203 160.534 155.825 164.75 170.188 164.75L170.188 163.573ZM136.269 151.164L137.09 150.321C128.963 142.405 127.647 133.204 127.647 119.519H126.47H125.294C125.294 133.3 126.588 143.377 135.448 152.007L136.269 151.164ZM126.47 119.519H127.647C127.647 103.502 129.685 89.4703 139.262 79.6811L138.421 78.8584L137.58 78.0357C127.301 88.5428 125.294 103.436 125.294 119.519H126.47ZM138.421 78.8584L139.262 79.6811C147.68 71.0755 158.205 66.2037 170.936 65.0713L170.832 63.8994L170.728 62.7276C157.472 63.9067 146.414 69.0054 137.58 78.0357L138.421 78.8584Z" fill="#1E1F28" mask="url(#path-2-inside-1_3964_35164)"/>' +
  '<circle cx="152.941" cy="93.0479" r="11.7647" fill="#1E1F28"/>' +
  '<circle cx="194.117" cy="51.8716" r="5.29412" fill="#EF8600" stroke="#1E1F28" stroke-width="1.17647"/>' +
  '<circle cx="223.529" cy="45.9888" r="5.29412" fill="#EF8600" stroke="#1E1F28" stroke-width="1.17647"/>' +
  '<circle cx="220.588" cy="72.4593" r="8.23529" fill="#EF8600" stroke="#1E1F28" stroke-width="1.17647"/>' +
  '<path d="M155.882 134.224C155.882 139.097 151.932 143.047 147.059 143.047C142.186 143.047 138.235 139.097 138.235 134.224C138.235 129.351 142.186 125.4 147.059 125.4C151.932 125.4 155.882 129.351 155.882 134.224Z" fill="#1E1F28"/>' +
  '<path d="M211.765 119.519C211.765 124.392 207.814 128.342 202.941 128.342C198.068 128.342 194.118 124.392 194.118 119.519C194.118 114.646 198.068 110.695 202.941 110.695C207.814 110.695 211.765 114.646 211.765 119.519Z" fill="#1E1F28"/>' +
  '<path d="M188.235 145.99C188.235 149.239 185.602 151.872 182.353 151.872C179.104 151.872 176.47 149.239 176.47 145.99C176.47 142.741 179.104 140.107 182.353 140.107C185.602 140.107 188.235 142.741 188.235 145.99Z" fill="#1E1F28"/>' +
  '<path d="M286.395 58.4209C301.55 58.4209 313.687 62.8922 322.746 71.7767C331.804 80.6612 336.334 92.5072 336.334 107.373C336.334 123.806 330.991 137.278 320.365 147.847C309.738 158.415 296.034 163.699 279.368 163.699C264.445 163.699 252.541 159.344 243.656 150.634C234.713 141.924 230.242 130.31 230.242 115.851C230.242 98.9528 235.468 85.1905 245.921 74.5059C256.373 63.8213 269.845 58.479 286.395 58.479V58.4209ZM286.627 77.932C276.813 77.932 268.8 81.4741 262.586 88.5585C256.373 95.6429 253.295 104.702 253.295 115.735C253.295 124.503 255.618 131.413 260.322 136.407C264.967 141.401 271.355 143.898 279.484 143.898C289.704 143.898 297.892 140.53 304.047 133.794C310.203 127.058 313.28 117.999 313.28 106.618C313.28 97.5011 310.958 90.4167 306.312 85.4228C301.667 80.4289 295.163 77.932 286.685 77.932H286.627Z" fill="white"/>' +
  '<path d="M339.469 159.631L360.548 0H382.673L368.968 103.478L418.501 61.9592H447.245L393.88 106.846L435.399 159.573H408.629L368.562 107.659L361.536 159.573H339.411L339.469 159.631Z" fill="white"/>' +
  '<path d="M438.128 159.634L451.019 62.0203H473.143L460.252 159.634H438.128ZM452.761 27.8178C452.761 24.1595 454.039 21.0819 456.652 18.5269C459.265 15.9718 462.343 14.6943 466.059 14.6943C469.775 14.6943 472.853 15.9718 475.408 18.4688C477.905 20.9657 479.182 24.1015 479.182 27.7598C479.182 31.4181 477.905 34.6699 475.408 37.225C472.911 39.78 469.775 41.0575 466.059 41.0575C462.343 41.0575 459.033 39.78 456.536 37.225C454.039 34.6699 452.761 31.5342 452.761 27.7598V27.8178Z" fill="white"/>' +
  '<path d="M551.653 129.668L567.622 142.153C561.931 149.644 555.776 155.102 549.098 158.528C542.42 161.954 534.755 163.697 526.103 163.697C511.585 163.697 499.914 159.341 490.971 150.573C482.028 141.805 477.615 130.307 477.615 116.022C477.615 99.2984 482.725 85.5362 493.003 74.7935C503.282 64.0508 516.347 58.6504 532.2 58.6504C545.439 58.6504 556.008 62.7733 563.847 70.9609C571.686 79.1486 575.635 90.1817 575.635 103.944C575.635 105.105 575.635 106.615 575.461 108.415C575.345 110.215 575.229 112.422 574.996 114.977H500.552C500.552 123.861 502.759 130.888 507.23 136.114C511.702 141.34 517.625 144.011 525.057 144.011C530.225 144.011 535.103 142.734 539.749 140.237C544.394 137.74 548.343 134.198 551.653 129.668ZM502.527 99.0662H552.872C552.64 92.4463 550.608 87.2782 546.717 83.4457C542.826 79.6132 537.658 77.755 531.096 77.755C523.664 77.755 517.392 79.6712 512.224 83.5038C507.056 87.3363 503.804 92.5044 502.469 99.0662H502.527Z" fill="white"/>' +
  '<path d="M604.96 159.627H581.384L601.186 8.88086H632.369C644.389 8.88086 653.041 9.57768 658.325 10.9133C663.609 12.3069 668.313 14.6297 672.436 17.9396C676.965 21.4818 680.449 25.953 682.83 31.2954C685.211 36.6377 686.43 42.5607 686.43 49.1805C686.43 56.9617 685.037 63.8719 682.249 70.0271C679.462 76.1824 675.455 81.2924 670.171 85.4153C665.642 89.0156 660.3 91.5125 654.202 93.0223C648.105 94.5321 638.64 95.287 625.865 95.287H613.38L604.96 159.627ZM616.225 73.7435H624.181C638.988 73.7435 649.092 72.0015 654.493 68.4593C659.893 64.9171 662.564 58.8199 662.564 50.1677C662.564 42.9091 660.3 37.799 655.77 34.8375C651.241 31.876 642.472 30.4243 629.523 30.4243H621.916L616.225 73.8016V73.7435Z" fill="#EF8600"/>' +
  '<path d="M762.326 159.632H740.202L741.828 148.947C737.995 153.825 733.582 157.483 728.53 159.864C723.536 162.245 717.729 163.464 711.226 163.464C698.45 163.464 688.579 159.458 681.611 151.386C674.642 143.314 671.158 131.875 671.158 117.067C671.158 99.5307 675.397 85.4781 683.933 74.7354C692.469 63.9927 703.619 58.6504 717.381 58.6504C723.885 58.6504 729.982 59.986 735.556 62.7152C741.131 65.4444 746.299 69.5673 751.061 75.1419L753.035 62.0764H775.159L762.268 159.69L762.326 159.632ZM694.153 113.874C694.153 123.223 696.302 130.481 700.657 135.707C705.012 140.934 710.993 143.547 718.658 143.547C727.543 143.547 734.511 140.005 739.679 132.92C744.847 125.836 747.402 116.08 747.402 103.654C747.402 95.2336 745.08 88.4977 740.492 83.5038C735.905 78.5099 729.691 76.0129 721.852 76.0129C713.432 76.0129 706.696 79.439 701.644 86.233C696.65 93.027 694.153 102.202 694.153 113.816V113.874Z" fill="#EF8600"/>' +
  '<path d="M802.624 159.631H780.5L801.405 0H823.529L802.624 159.631Z" fill="#EF8600"/></g><defs>' +
  '<clipPath id="clip0_3964_35164"><rect width="823.529" height="163.637" fill="white"/></clipPath></defs></svg>';

/**
 * Everything written into the page is either fixed text from `laws.ts` or a
 * name read off a page that may be hostile, so every interpolation goes through
 * here. Quotes and slashes included: a cookie name is printable ASCII, but this
 * must hold even if that ever changes.
 */
const esc = (value: string): string =>
  value.replace(
    /[&<>"'/]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#47;' })[char] ?? char,
  );

/** How many groups are drawn inline before the rest is left to the inventory. */
const TOP_GROUPS = 8;

const STYLE = `
:root {
  color-scheme: light;
  --bg: #F4F7FD; --surface: #FFFFFF; --ink: #141525; --body: #3A3C55; --muted: #6C6E88;
  --line: #DCE5FA; --rule: #CFDBFF; --brand: #0069EF; --deep: #4B5BE7; --flag: #B42318;
  --flag-edge: #D92D20; --lead-edge: #912018; --tint: #EDF0FF; --quiet: #F2F4FA;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --bg: #0D0E18; --surface: #171929; --ink: #EDF0FF; --body: #C4C8E0; --muted: #9B95A8;
    --line: #272A41; --rule: #333756; --brand: #3087FF; --deep: #8A95F2; --flag: #FF9A94;
    --flag-edge: #D92D20; --lead-edge: #FF7A70; --tint: #1B1F36; --quiet: #1E2134;
  }
  :root:not([data-theme="light"]) .logo-light { display: none; }
  :root:not([data-theme="light"]) .logo-dark { display: block; }
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0D0E18; --surface: #171929; --ink: #EDF0FF; --body: #C4C8E0; --muted: #9B95A8;
  --line: #272A41; --rule: #333756; --brand: #3087FF; --deep: #8A95F2; --flag: #FF9A94;
  --flag-edge: #D92D20; --lead-edge: #FF7A70; --tint: #1B1F36; --quiet: #1E2134;
}
:root[data-theme="dark"] .logo-light { display: none; }
:root[data-theme="dark"] .logo-dark { display: block; }
* { box-sizing: border-box; }
body {
  margin: 0; background: var(--bg); color: var(--body);
  font-family: "Public Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 16px; line-height: 1.6; -webkit-text-size-adjust: 100%;
}
.page { max-width: 56rem; margin: 0 auto; padding-inline: 16px; padding-block: 2.5rem 4rem; display: flex; flex-direction: column; gap: 2.5rem; }
h1, h2, h3 { color: var(--ink); text-wrap: balance; margin: 0; }
h1 { font-family: "Instrument Serif", Georgia, "Times New Roman", serif; font-weight: 400; font-size: clamp(2rem, 6vw, 2.9rem); line-height: 1.1; letter-spacing: -0.01em; }
h2 { font-family: "Instrument Serif", Georgia, serif; font-weight: 400; font-size: 1.5rem; line-height: 1.2; }
h3 { font-size: 1rem; font-weight: 650; }
p { margin: 0; }
.eyebrow { font-size: .72rem; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; color: var(--muted); }
.masthead { display: flex; align-items: center; gap: .6rem; }
.logo { display: block; width: 150px; height: auto; }
.logo-dark { display: none; }
.head { display: flex; flex-direction: column; gap: 1rem; }
.target { font-family: "JetBrains Mono", ui-monospace, Menlo, monospace; font-size: 1rem; color: var(--brand); overflow-wrap: anywhere; }
.facts { display: flex; flex-wrap: wrap; gap: .4rem 1.25rem; font-size: .85rem; color: var(--muted); }
.facts b { font-weight: 600; color: var(--body); font-variant-numeric: tabular-nums; }
.section { display: flex; flex-direction: column; gap: 1rem; }
.scroller { overflow-x: auto; }
table.grid { width: 100%; border-collapse: collapse; font-size: .85rem; }
table.grid th, table.grid td { border: 1px solid var(--line); padding: .55rem .6rem; text-align: left; }
table.grid thead th { background: var(--quiet); color: var(--ink); font-size: .76rem; font-weight: 650; }
table.grid td.mark-cell { text-align: center; width: 6.5rem; font-weight: 700; }
table.grid .yes { color: var(--flag); }
table.grid td.mark-cell.no { color: var(--muted); font-weight: 500; }
.finding { background: var(--surface); border: 1px solid var(--line); border-left: 4px solid var(--flag-edge); border-radius: 10px; padding: 1.25rem 1.35rem; display: flex; flex-direction: column; gap: .8rem; }
.finding.lead { border-left-color: var(--lead-edge); }
.finding.clean { border-left-color: var(--brand); }
.detail { color: var(--body); }
.shape { font-size: .88rem; color: var(--muted); }
.bars { display: flex; flex-direction: column; gap: .35rem; }
.bar { display: grid; grid-template-columns: 11rem 1fr 3rem; gap: .6rem; align-items: center; font-size: .84rem; }
@media (max-width: 560px) { .bar { grid-template-columns: 7.5rem 1fr 2.4rem; } }
.bar .lbl { color: var(--ink); font-weight: 550; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bar .track { background: var(--quiet); border-radius: 4px; height: .8rem; overflow: hidden; }
.bar .fill { background: var(--brand); height: 100%; border-radius: 4px; }
.bar .num { text-align: right; font-variant-numeric: tabular-nums; color: var(--muted); font-size: .8rem; }
.rest { font-size: .8rem; color: var(--muted); }
.jump { font-size: .84rem; color: var(--brand); text-decoration: none; font-weight: 600; align-self: flex-start; }
.jump:hover { text-decoration: underline; }
.lawline { display: grid; grid-template-columns: 8rem minmax(0, 1fr); gap: .2rem .9rem; font-size: .88rem; padding-block: .5rem; border-top: 1px dotted var(--rule); }
@media (max-width: 560px) { .lawline { grid-template-columns: 1fr; gap: .1rem; } }
.lawline .n { font-weight: 650; color: var(--ink); }
.lawline.off { color: var(--muted); }
.lawline.off .n { color: var(--muted); font-weight: 500; }
.band { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 1.2rem 1.35rem; display: flex; flex-direction: column; gap: .6rem; }
.notes { margin: 0; padding-left: 1.1rem; display: flex; flex-direction: column; gap: .5rem; font-size: .9rem; }
/*
 * The inventory scrolls in its own box, because a long one is longer than the
 * rest of the page put together. The scrollbar is styled rather than left to
 * the platform: macOS hides an overlay scrollbar until the pointer moves over
 * it, which leaves no sign that there are more rows. Styling the webkit
 * scrollbar opts the box out of overlay behaviour, so the bar is there from
 * the first paint.
 */
.invbox {
  max-height: 24rem; overflow: auto; border: 1px solid var(--line); border-radius: 8px;
  background: var(--surface); scrollbar-width: thin; scrollbar-color: var(--deep) var(--quiet);
}
.invbox::-webkit-scrollbar { width: 13px; height: 13px; }
.invbox::-webkit-scrollbar-track { background: var(--quiet); }
.invbox::-webkit-scrollbar-thumb { background: var(--rule); border-radius: 7px; border: 3px solid var(--quiet); }
.invbox::-webkit-scrollbar-thumb:hover { background: var(--deep); }
.invbox::-webkit-scrollbar-corner { background: var(--quiet); }
table.inv { width: 100%; border-collapse: collapse; font-size: .78rem; font-family: "JetBrains Mono", ui-monospace, Menlo, monospace; }
table.inv th, table.inv td { border-bottom: 1px solid var(--line); padding: .32rem .55rem; text-align: left; white-space: nowrap; }
table.inv thead th { position: sticky; top: 0; z-index: 1; background: var(--tint); color: var(--ink); font-size: .7rem; letter-spacing: .06em; text-transform: uppercase; font-family: "Public Sans", sans-serif; box-shadow: inset 0 -1px 0 var(--rule); }
table.inv tbody tr:nth-child(even) { background: var(--quiet); }
table.inv .dim { color: var(--muted); }
.endrow td { text-align: center; color: var(--muted); font-family: "Public Sans", sans-serif; font-size: .75rem; letter-spacing: .06em; text-transform: uppercase; }
.invhead { display: flex; flex-wrap: wrap; gap: .5rem 1rem; align-items: baseline; }
.invhead .count { font-size: .82rem; color: var(--muted); font-variant-numeric: tabular-nums; }
footer { border-top: 1px solid var(--rule); padding-top: 1.25rem; display: flex; flex-direction: column; gap: .6rem; font-size: .85rem; color: var(--muted); }
footer strong { color: var(--ink); }
`;

/** The findings whose own heading should read as the most serious, drawn first. */
const SEVERITY: Record<string, number> = {
  'active-after-reject': 0,
  'set-after-reject': 1,
  'tracking-before-consent': 2,
  'unidentified-cookies': 3,
  'hosts-before-consent': 4,
};

const ordered = (findings: Finding[]) =>
  [...findings].sort((a, b) => (SEVERITY[a.kind] ?? 9) - (SEVERITY[b.kind] ?? 9));

const bars = (finding: Finding): string => {
  if (finding.groups.length === 0) return '';
  const shown = finding.groups.slice(0, TOP_GROUPS);
  const rest = finding.groups.length - shown.length;
  const max = shown[0]?.count ?? 1;
  const drawn = shown
    .map(
      ({ label, count }) =>
        '<div class="bar">' +
        `<span class="lbl" title="${esc(label)}">${esc(label)}</span>` +
        `<span class="track"><span class="fill" style="width:${Math.max(2, Math.round((count / max) * 100))}%"></span></span>` +
        `<span class="num">${count}</span>` +
        '</div>',
    )
    .join('');
  const more = rest > 0 ? `<p class="rest">+ ${rest} more, listed in full below.</p>` : '';
  return `<div class="bars">${drawn}</div>${more}`;
};

const inventoryLink = (finding: Finding): string => {
  if (finding.cookies.length > 0) return '<a class="jump" href="#inventory-cookies">See every cookie below &#8595;</a>';
  if (finding.hosts.length > 0) return '<a class="jump" href="#inventory-hosts">See every host below &#8595;</a>';
  return '';
};

const lawLines = (finding: Finding): string =>
  [...finding.byLaw]
    .sort((a, b) => Number(b.applies) - Number(a.applies))
    .map(
      ({ name, applies, text }) =>
        `<div class="lawline${applies ? '' : ' off'}">` +
        `<span class="n">${esc(name)}</span><span>${esc(text)}</span></div>`,
    )
    .join('');

const findingBlock = (finding: Finding): string =>
  `<article class="finding${(SEVERITY[finding.kind] ?? 9) < 2 ? ' lead' : ''}">` +
  `<h3>${esc(finding.title)}</h3>` +
  `<p class="detail">${esc(finding.detail)}</p>` +
  (finding.shape ? `<p class="shape">${esc(finding.shape)}</p>` : '') +
  bars(finding) +
  inventoryLink(finding) +
  lawLines(finding) +
  '</article>';

const grid = (findings: Finding[]): string =>
  '<section class="section"><p class="eyebrow">What was found, against each law</p>' +
  '<div class="scroller"><table class="grid"><thead><tr><th>What the check found</th>' +
  (findings[0]?.byLaw ?? []).map(({ name }) => `<th class="mark-cell">${esc(name)}</th>`).join('') +
  '</tr></thead><tbody>' +
  findings
    .map(
      (finding) =>
        `<tr><td>${esc(finding.title)}</td>` +
        finding.byLaw
          .map(
            ({ applies }) =>
              `<td class="mark-cell ${applies ? 'yes' : 'no'}">${applies ? 'flagged' : 'not flagged'}</td>`,
          )
          .join('') +
        '</tr>',
    )
    .join('') +
  '</tbody></table></div>' +
  '<p class="shape">Everything marked <strong>flagged</strong> is explained below. <strong>Not flagged</strong> ' +
  'means that law does not treat it as a problem, and the reason is given with the finding. Neither is a verdict ' +
  'on the page.</p></section>';

const cleanBlock = (assessment: Assessment): string =>
  '<article class="finding clean">' +
  '<h3>Nothing was flagged on this page</h3>' +
  `<p class="detail">The check read ${assessment.checked.cookies} ` +
  `cookie${assessment.checked.cookies === 1 ? '' : 's'} and ${assessment.checked.thirdPartyHosts} ` +
  `third-party host${assessment.checked.thirdPartyHosts === 1 ? '' : 's'} before any consent was given, and ` +
  'found nothing that is not strictly necessary. ' +
  (assessment.checked.consentTested
    ? 'Pressing the banner’s reject button left nothing running.'
    : 'The consent action was not tested, so what the banner’s buttons do is not covered.') +
  `</p><p class="shape">${esc(assessment.scope)}</p>` +
  '</article>' +
  // The only place the laws are set out on their own. With findings, each law
  // speaks through the finding it applies to; with none, this is what is left
  // to say, and the check should still name what it was read against.
  '<section class="section"><p class="eyebrow">What each law asks for</p>' +
  assessment.laws
    .map(
      ({ name, where, asks }) =>
        '<article class="finding clean">' +
        `<h3>${esc(name)}</h3><p class="shape">Protects ${esc(where)}</p>` +
        `<p class="detail">${esc(asks)}</p></article>`,
    )
    .join('') +
  '</section>';

const notes = (assessment: Assessment): string =>
  assessment.notes.length === 0
    ? ''
    : '<section class="band"><p class="eyebrow">Worth knowing</p>' +
      `<ul class="notes">${assessment.notes.map((note) => `<li>${esc(note)}</li>`).join('')}</ul></section>`;

/** How many rows fit the box before it starts scrolling; only used to word the hint. */
const ROWS_IN_VIEW = 14;

const scrollHint = (total: number) =>
  total > ROWS_IN_VIEW ? `${total} in total, none left out \u2014 scroll for the rest` : `${total} in total`;

/**
 * The full lists, at the foot of the page. Nothing is
 * truncated: a finding above says the shape, and this holds every row. The box
 * scrolls, with a scrollbar that is visible before the pointer reaches it.
 */
const inventory = (assessment: Assessment): string => {
  const { cookies, hosts } = assessment.inventory;
  const cookieTable =
    cookies.length === 0
      ? ''
      : '<section class="section" id="inventory-cookies">' +
        '<div class="invhead"><h2>Every cookie set before consent</h2>' +
        `<span class="count">${scrollHint(cookies.length)}</span></div>` +
        '<div class="invbox"><table class="inv"><thead><tr><th>Cookie</th><th>Domain</th>' +
        '<th>Category</th><th>Vendor</th></tr></thead><tbody>' +
        cookies
          .map(
            ({ name, domain, category, vendor }) =>
              `<tr><td>${esc(name || '(unnamed)')}</td><td>${esc(domain)}</td>` +
              `<td>${esc(category)}</td>` +
              `<td${vendor ? '' : ' class="dim"'}>${vendor ? esc(vendor) : 'not recognised'}</td></tr>`,
          )
          .join('') +
        `<tr class="endrow"><td colspan="4">End of ${cookies.length} cookies</td></tr>` +
        '</tbody></table></div></section>';

  const hostTable =
    hosts.length === 0
      ? ''
      : '<section class="section" id="inventory-hosts">' +
        '<div class="invhead"><h2>Every third-party host contacted before consent</h2>' +
        `<span class="count">${scrollHint(hosts.length)}</span></div>` +
        '<div class="invbox"><table class="inv"><thead><tr><th>Host</th><th>Domain</th></tr></thead><tbody>' +
        hosts.map(({ host, domain }) => `<tr><td>${esc(host)}</td><td class="dim">${esc(domain)}</td></tr>`).join('') +
        `<tr class="endrow"><td colspan="2">End of ${hosts.length} hosts</td></tr>` +
        '</tbody></table></div></section>';

  return cookieTable + hostTable;
};

/** The page title names the site checked, so it is picked out of a gallery of many. */
const titleFor = (page: string): string => {
  try {
    return `${new URL(page).host} cookie check`;
  } catch {
    return 'Cookie check';
  }
};

/** Everything that belongs in a document head: the title, the typefaces and the styles. */
const headOf = (assessment: Assessment): string =>
  `<title>${esc(titleFor(assessment.page))}</title>` +
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1' +
  '&family=JetBrains+Mono:wght@400;500&family=Public+Sans:wght@400;500;600;700&display=swap">' +
  `<style>${STYLE}</style>`;

/** Everything that belongs in a document body. */
const bodyOf = (assessment: Assessment): string => {
  const when = assessment.checkedAt ? assessment.checkedAt.slice(0, 10) : null;
  const findings = ordered(assessment.findings);
  const facts = [
    `<span>Cookies before consent <b>${assessment.checked.cookies}</b></span>`,
    `<span>Third-party hosts <b>${assessment.checked.thirdPartyHosts}</b></span>`,
    `<span>Consent action <b>${assessment.checked.consentTested ? 'tested' : 'not tested'}</b></span>`,
    assessment.country ? `<span>Ran from <b>${esc(assessment.country)}</b></span>` : '',
    when ? `<span>Checked <b>${esc(when)}</b></span>` : '',
  ].join('');

  return (
    '<main class="page">' +
    '<header class="head">' +
    `<div class="masthead">${LOGO_LIGHT}${LOGO_DARK}</div>` +
    '<h1>What this page did before anyone agreed</h1>' +
    `<p class="target">${esc(assessment.page)}</p>` +
    `<div class="facts">${facts}</div>` +
    '</header>' +
    (assessment.clean ? '' : grid(findings)) +
    `<section class="section">${assessment.clean ? cleanBlock(assessment) : findings.map(findingBlock).join('')}</section>` +
    notes(assessment) +
    inventory(assessment) +
    '<footer>' +
    `<p><strong>Scope.</strong> ${esc(assessment.scope)}</p>` +
    `<p><strong>Not a verdict.</strong> ${esc(assessment.noVerdict)}</p>` +
    '<p>Checked on this machine with the CookiePal plugin for Claude Code. ' +
    'The page was loaded in a temporary browser profile; no cookie values were read.</p>' +
    '</footer>' +
    '</main>'
  );
};

/**
 * The page as the artifact publisher wants it: a fragment, with no doctype,
 * html, head or body tags of its own, which it wraps in its own shell.
 */
export const renderReport = (assessment: Assessment): string => headOf(assessment) + bodyOf(assessment);

/**
 * The same page as a file someone can open in a browser.
 *
 * A file on disk has no publisher to wrap it, so this adds the equivalent
 * shell: the doctype that keeps the browser out of quirks mode, the charset and
 * viewport metas, and the few base rules the publisher applies. The head and
 * body content are the same, so the file looks like the published page rather
 * than merely holding the same words.
 */
export const renderDocument = (assessment: Assessment): string =>
  '<!doctype html>\n<html lang="en">\n<head>\n' +
  '<meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
  `${headOf(assessment)}\n` +
  '<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n' +
  `</head>\n<body>\n${bodyOf(assessment)}\n</body>\n</html>\n`;
