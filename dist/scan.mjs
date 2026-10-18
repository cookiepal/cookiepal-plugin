#!/usr/bin/env node
// Built from src/ by pnpm build. Do not edit: CI fails when this file is out of date.
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/tldts@7.4.18/node_modules/tldts/dist/cjs/index.js
var require_cjs = __commonJS({
  "node_modules/.pnpm/tldts@7.4.18/node_modules/tldts/dist/cjs/index.js"(exports) {
    "use strict";
    function shareSameDomainSuffix(hostname, vhost) {
      if (hostname.endsWith(vhost)) {
        return hostname.length === vhost.length || hostname[hostname.length - vhost.length - 1] === ".";
      }
      return false;
    }
    function extractDomainWithSuffix(hostname, publicSuffix) {
      const publicSuffixIndex = hostname.length - publicSuffix.length - 2;
      const lastDotBeforeSuffixIndex = hostname.lastIndexOf(".", publicSuffixIndex);
      if (lastDotBeforeSuffixIndex === -1) {
        return hostname;
      }
      return hostname.slice(lastDotBeforeSuffixIndex + 1);
    }
    function getDomain$1(suffix, hostname, options) {
      if (options.validHosts !== null) {
        const validHosts = options.validHosts;
        for (const vhost of validHosts) {
          if (
            /*@__INLINE__*/
            shareSameDomainSuffix(hostname, vhost)
          ) {
            return vhost;
          }
        }
      }
      let numberOfLeadingDots = 0;
      if (hostname.startsWith(".")) {
        while (numberOfLeadingDots < hostname.length && hostname[numberOfLeadingDots] === ".") {
          numberOfLeadingDots += 1;
        }
      }
      if (suffix.length === hostname.length - numberOfLeadingDots) {
        return null;
      }
      return (
        /*@__INLINE__*/
        extractDomainWithSuffix(hostname, suffix)
      );
    }
    function getDomainWithoutSuffix$1(domain, suffix) {
      return domain.slice(0, -suffix.length - 1);
    }
    var CONTROL_CHARS = /[\t\n\r]/g;
    var extractedHostnameValidated = false;
    function isValidHostnameChar(code) {
      return code >= 97 && code <= 122 || // a-z
      code >= 48 && code <= 57 || // 0-9
      code > 127 || // non-ASCII (accepted, not punycode-checked)
      code >= 65 && code <= 90 || // A-Z (becomes valid once lowercased)
      code === 45 || // '-'
      code === 95;
    }
    function getSpecialScheme(url, schemeStart, colonIndex) {
      const length = colonIndex - schemeStart;
      const c0 = url.charCodeAt(schemeStart) | 32;
      if (length === 2) {
        return c0 === 119 && (url.charCodeAt(schemeStart + 1) | 32) === 115 ? 1 : 0;
      } else if (length === 3) {
        const c1 = url.charCodeAt(schemeStart + 1) | 32;
        const c2 = url.charCodeAt(schemeStart + 2) | 32;
        if (c0 === 119 && c1 === 115 && c2 === 115)
          return 1;
        if (c0 === 102 && c1 === 116 && c2 === 112)
          return 1;
        return 0;
      } else if (length === 4) {
        const c1 = url.charCodeAt(schemeStart + 1) | 32;
        const c2 = url.charCodeAt(schemeStart + 2) | 32;
        const c3 = url.charCodeAt(schemeStart + 3) | 32;
        if (c0 === 104 && c1 === 116 && c2 === 116 && c3 === 112)
          return 1;
        if (c0 === 102 && c1 === 105 && c2 === 108 && c3 === 101)
          return 2;
        return 0;
      } else if (length === 5) {
        return c0 === 104 && (url.charCodeAt(schemeStart + 1) | 32) === 116 && (url.charCodeAt(schemeStart + 2) | 32) === 116 && (url.charCodeAt(schemeStart + 3) | 32) === 112 && (url.charCodeAt(schemeStart + 4) | 32) === 115 ? 1 : 0;
      }
      return 0;
    }
    function extractHostname(url, urlIsValidHostname, validate = false) {
      let start = 0;
      let end = url.length;
      let hasUpper = false;
      let isSpecial = false;
      extractedHostnameValidated = false;
      if (!urlIsValidHostname) {
        if (url.startsWith("data:")) {
          return null;
        }
        while (start < url.length && url.charCodeAt(start) <= 32) {
          start += 1;
        }
        while (end > start + 1 && url.charCodeAt(end - 1) <= 32) {
          end -= 1;
        }
        if (url.charCodeAt(start) === 47 && url.charCodeAt(start + 1) === 47) {
          start += 2;
        } else {
          const indexOfProtocol = url.indexOf(":/", start);
          if (indexOfProtocol !== -1) {
            const special = getSpecialScheme(url, start, indexOfProtocol);
            if (special === 1) {
              isSpecial = true;
              start = indexOfProtocol + 2;
              while (url.charCodeAt(start) === 47 || url.charCodeAt(start) === 92) {
                start += 1;
              }
            } else if (special === 2) {
              isSpecial = true;
              start = indexOfProtocol + 1;
              let slashes = 0;
              while ((url.charCodeAt(start) === 47 || url.charCodeAt(start) === 92) && slashes < 2) {
                start += 1;
                slashes += 1;
              }
              if (slashes < 2) {
                return null;
              }
            } else {
              for (let i = start; i < indexOfProtocol; i += 1) {
                const code = url.charCodeAt(i) | 32;
                if (!(code >= 97 && code <= 122 || // [a, z]
                code >= 48 && code <= 57 || // [0, 9]
                code === 46 || // '.'
                code === 45 || // '-'
                code === 43)) {
                  const raw = url.charCodeAt(i);
                  if (raw === 9 || raw === 10 || raw === 13) {
                    return extractHostname(url.replace(CONTROL_CHARS, ""), urlIsValidHostname, validate);
                  }
                  return null;
                }
              }
              if (url.charCodeAt(indexOfProtocol + 2) === 47) {
                start = indexOfProtocol + 3;
              } else {
                return null;
              }
            }
          } else if (url.charCodeAt(start) !== 91) {
            let indexOfColon = -1;
            for (let i = start; i < end; i += 1) {
              const code = url.charCodeAt(i);
              if (code === 9 || code === 10 || code === 13) {
                return extractHostname(url.replace(CONTROL_CHARS, ""), urlIsValidHostname, validate);
              }
              if (code === 58) {
                indexOfColon = i;
                break;
              }
              if (code === 47 || code === 92 || code === 63 || code === 35) {
                break;
              }
            }
            if (indexOfColon !== -1) {
              let hasIdentifier = false;
              for (let i = indexOfColon + 1; i < end; i += 1) {
                const code = url.charCodeAt(i);
                if (code === 47 || code === 92 || code === 63 || code === 35) {
                  break;
                }
                if (code === 64) {
                  hasIdentifier = true;
                  break;
                }
              }
              if (!hasIdentifier) {
                let allDigits = true;
                let i = indexOfColon + 1;
                for (; i < end; i += 1) {
                  const code = url.charCodeAt(i);
                  if (code === 47 || code === 92 || code === 63 || code === 35) {
                    break;
                  }
                  if (code < 48 || code > 57) {
                    allDigits = false;
                    break;
                  }
                }
                if (i === indexOfColon + 1) {
                  allDigits = false;
                }
                if (!allDigits) {
                  const special = getSpecialScheme(url, start, indexOfColon);
                  if (special === 0) {
                    let isBareIpv6 = false;
                    for (let j = indexOfColon + 1; j < end; j += 1) {
                      const code = url.charCodeAt(j);
                      if (code === 47 || code === 92 || code === 63 || code === 35) {
                        break;
                      }
                      if (code === 58) {
                        isBareIpv6 = true;
                        break;
                      }
                    }
                    if (!isBareIpv6) {
                      return null;
                    }
                  } else {
                    isSpecial = true;
                    start = indexOfColon + 1;
                    if (special === 2) {
                      let slashes = 0;
                      while ((url.charCodeAt(start) === 47 || url.charCodeAt(start) === 92) && slashes < 2) {
                        start += 1;
                        slashes += 1;
                      }
                      if (slashes < 2) {
                        return null;
                      }
                    } else {
                      while (url.charCodeAt(start) === 47 || url.charCodeAt(start) === 92) {
                        start += 1;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        let indexOfIdentifier = -1;
        let indexOfClosingBracket = -1;
        let indexOfPort = -1;
        let indexOfFirstColon = -1;
        let hasControl = false;
        let vValid = validate;
        let vLastDot = start - 1;
        let vLastCode = -1;
        if (validate && start < end) {
          const c0 = url.charCodeAt(start);
          if (
            // Keep these parens: they scope /*@__INLINE__*/ for terser.
            // prettier-ignore
            !/*@__INLINE__*/
            (isValidHostnameChar(c0) || c0 === 46 || c0 === 95) || c0 === 45
          ) {
            vValid = false;
          }
        }
        for (let i = start; i < end; i += 1) {
          const code = url.charCodeAt(i);
          if (code < 64) {
            if (code === 47 || code === 35 || code === 63) {
              end = i;
              break;
            } else if (code === 58) {
              if (indexOfFirstColon === -1) {
                indexOfFirstColon = i;
              }
              indexOfPort = i;
            } else if (code === 9 || code === 10 || code === 13) {
              hasControl = true;
            } else if (validate) {
              if (code === 46) {
                if (i - vLastDot > 64 || vLastCode === 46 || vLastCode === 45) {
                  vValid = false;
                }
                vLastDot = i;
              } else if (code < 48 || code > 57) {
                if (code !== 45 || vLastCode === 46) {
                  vValid = false;
                }
              }
            }
          } else if (isSpecial && code === 92) {
            end = i;
            break;
          } else if (code === 64) {
            indexOfIdentifier = i;
            indexOfFirstColon = -1;
          } else if (code === 93) {
            indexOfClosingBracket = i;
          } else if (code >= 65 && code <= 90) {
            hasUpper = true;
          } else if (validate && !/*@__INLINE__*/
          isValidHostnameChar(code)) {
            vValid = false;
          }
          if (validate) {
            vLastCode = code;
          }
        }
        if (hasControl) {
          return extractHostname(url.replace(CONTROL_CHARS, ""), urlIsValidHostname, validate);
        }
        if (indexOfIdentifier !== -1 && indexOfIdentifier >= start && indexOfIdentifier < end) {
          start = indexOfIdentifier + 1;
        }
        if (url.charCodeAt(start) === 91) {
          if (indexOfClosingBracket !== -1) {
            return url.slice(start + 1, indexOfClosingBracket).toLowerCase();
          }
          return null;
        } else if (indexOfPort !== -1 && indexOfPort > start && indexOfPort < end && // A host:port has exactly one ':' in the host (so its first ':' is its
        // last); a bare, unbracketed IPv6 literal ("2a01:e35::1") has >= 2, so
        // its first ':' precedes the last. Only the former has a ':port' to trim.
        indexOfFirstColon === indexOfPort) {
          end = indexOfPort;
        }
        if (start >= end) {
          return null;
        }
        if (validate && vValid && indexOfIdentifier === -1 && indexOfPort === -1 && indexOfClosingBracket === -1 && url.charCodeAt(end - 1) !== 46 && end - start <= 255 && // total length
        end - vLastDot - 1 <= 63 && // last label length
        vLastCode !== 45) {
          extractedHostnameValidated = true;
        }
      }
      while (end > start + 1 && url.charCodeAt(end - 1) === 46) {
        end -= 1;
      }
      const hostname = start !== 0 || end !== url.length ? url.slice(start, end) : url;
      if (hasUpper) {
        return hostname.toLowerCase();
      }
      return hostname;
    }
    function isProbablyIpv4(hostname) {
      if (hostname.length < 7) {
        return false;
      }
      if (hostname.length > 15) {
        return false;
      }
      let numberOfDots = 0;
      for (let i = 0; i < hostname.length; i += 1) {
        const code = hostname.charCodeAt(i);
        if (code === 46) {
          numberOfDots += 1;
        } else if (code < 48 || code > 57) {
          return false;
        }
      }
      return numberOfDots === 3 && hostname.charCodeAt(0) !== 46 && hostname.charCodeAt(hostname.length - 1) !== 46;
    }
    function isProbablyIpv6(hostname) {
      if (hostname.length < 3) {
        return false;
      }
      let start = hostname.startsWith("[") ? 1 : 0;
      let end = hostname.length;
      if (hostname[end - 1] === "]") {
        end -= 1;
      }
      if (end - start > 39) {
        return false;
      }
      let hasColon = false;
      for (; start < end; start += 1) {
        const code = hostname.charCodeAt(start);
        if (code === 58) {
          hasColon = true;
        } else if (!(code >= 48 && code <= 57 || // 0-9
        code >= 97 && code <= 102 || // a-f
        code >= 65 && code <= 70)) {
          return false;
        }
      }
      return hasColon;
    }
    function isIp(hostname) {
      return isProbablyIpv6(hostname) || isProbablyIpv4(hostname);
    }
    var SPECIAL_USE_DOMAINS = [
      "test",
      // RFC 6761
      "localhost",
      // RFC 6761
      "invalid",
      // RFC 6761
      "example",
      // RFC 6761
      "example.com",
      // RFC 6761
      "example.net",
      // RFC 6761
      "example.org",
      // RFC 6761
      "local",
      // RFC 6762 (mDNS)
      "onion",
      // RFC 7686 (Tor)
      "alt",
      // RFC 9476
      "home.arpa",
      // RFC 8375
      "ipv4only.arpa",
      // RFC 8880
      "resolver.arpa",
      // RFC 9462
      "service.arpa",
      // RFC 9665
      "6tisch.arpa",
      // RFC 9031
      "eap.arpa"
      // RFC 9965
    ];
    function isSpecialUse(hostname) {
      for (const name of SPECIAL_USE_DOMAINS) {
        if (hostname.endsWith(name) && (hostname.length === name.length || hostname.charCodeAt(hostname.length - name.length - 1) === 46)) {
          return true;
        }
      }
      return false;
    }
    function isValidAscii(code) {
      return code >= 97 && code <= 122 || code >= 48 && code <= 57 || code > 127;
    }
    function isValidHostname(hostname) {
      if (hostname.length > 255) {
        return false;
      }
      if (hostname.length === 0) {
        return false;
      }
      if (
        /*@__INLINE__*/
        !isValidAscii(hostname.charCodeAt(0)) && hostname.charCodeAt(0) !== 46 && // '.' (dot)
        hostname.charCodeAt(0) !== 95
      ) {
        return false;
      }
      let lastDotIndex = -1;
      let lastCharCode = -1;
      const len = hostname.length;
      for (let i = 0; i < len; i += 1) {
        const code = hostname.charCodeAt(i);
        if (code === 46) {
          if (
            // Check that previous label is < 63 bytes long (64 = 63 + '.')
            i - lastDotIndex > 64 || // Check that previous character was not already a '.'
            lastCharCode === 46 || // Check that the previous label does not end with '-' (RFC 1035 §2.3.1 LDH).
            // '_' is intentionally NOT restricted: DNS allows any octet (RFC 2181 §11) and
            // WHATWG URL does not treat '_' as a forbidden host code point.
            lastCharCode === 45
          ) {
            return false;
          }
          lastDotIndex = i;
        } else if (
          // A forbidden character in the label...
          // Keep these parens: they scope /*@__INLINE__*/ for terser.
          // prettier-ignore
          !/*@__INLINE__*/
          (isValidAscii(code) || code === 45 || code === 95) || // ...or a '-' starting a label (the byte right after a '.'). A label must
          // not begin with a hyphen (RFC 1034 §3.5 / RFC 1035 §2.3.1 LDH, as amended
          // by RFC 1123 §2.1; cf. UTS #46 CheckHyphens). The first label is covered by
          // the leading-character guard above; mirrors the trailing-'-' rule below.
          code === 45 && lastCharCode === 46
        ) {
          return false;
        }
        lastCharCode = code;
      }
      return (
        // Check that last label is shorter than 63 chars
        len - lastDotIndex - 1 <= 63 && // Check that the last character is an allowed trailing label character.
        // Since we already checked that the char is a valid hostname character,
        // we only need to check that it's different from '-'.
        lastCharCode !== 45
      );
    }
    function setDefaultsImpl({ allowIcannDomains = true, allowPrivateDomains = false, detectIp = true, detectSpecialUse = false, extractHostname: extractHostname2 = true, mixedInputs = true, validHosts = null, validateHostname = true }) {
      return {
        allowIcannDomains,
        allowPrivateDomains,
        detectIp,
        detectSpecialUse,
        extractHostname: extractHostname2,
        mixedInputs,
        validHosts,
        validateHostname
      };
    }
    var DEFAULT_OPTIONS = (
      /*@__INLINE__*/
      setDefaultsImpl({})
    );
    function setDefaults(options) {
      if (options === void 0) {
        return DEFAULT_OPTIONS;
      }
      return (
        /*@__INLINE__*/
        setDefaultsImpl(options)
      );
    }
    function getSubdomain$1(hostname, domain) {
      if (domain.length === hostname.length) {
        return "";
      }
      return hostname.slice(0, -domain.length - 1);
    }
    function getEmptyResult() {
      return {
        domain: null,
        domainWithoutSuffix: null,
        hostname: null,
        isIcann: null,
        isIp: null,
        isPrivate: null,
        isSpecialUse: null,
        publicSuffix: null,
        subdomain: null
      };
    }
    function resetResult(result) {
      result.domain = null;
      result.domainWithoutSuffix = null;
      result.hostname = null;
      result.isIcann = null;
      result.isIp = null;
      result.isPrivate = null;
      result.isSpecialUse = null;
      result.publicSuffix = null;
      result.subdomain = null;
    }
    function parseImpl(url, step, suffixLookup2, partialOptions, result) {
      const options = (
        /*@__INLINE__*/
        setDefaults(partialOptions)
      );
      if (typeof url !== "string") {
        return result;
      }
      let urlIsValid = false;
      if (!options.extractHostname) {
        result.hostname = url;
      } else if (options.mixedInputs) {
        urlIsValid = isValidHostname(url);
        result.hostname = extractHostname(url, urlIsValid, options.validateHostname);
      } else {
        result.hostname = extractHostname(url, false, options.validateHostname);
      }
      if (options.detectIp && result.hostname !== null) {
        result.isIp = isIp(result.hostname);
        if (result.isIp) {
          return result;
        }
      }
      if (options.validateHostname && options.extractHostname && result.hostname !== null && // Skip the re-scan when `url` was already validated and extractHostname
      // returned it unchanged (same reference => identical string, still valid).
      !(urlIsValid && result.hostname === url) && // Skip the re-scan when extractHostname already validated the host inline
      // (a confirmed-valid simple authority — see extract-hostname.ts).
      !extractedHostnameValidated && !isValidHostname(result.hostname)) {
        result.hostname = null;
        return result;
      }
      if (step === 0 || result.hostname === null) {
        return result;
      }
      if (step === 5 && options.detectSpecialUse) {
        result.isSpecialUse = isSpecialUse(result.hostname);
      }
      suffixLookup2(result.hostname, options, result);
      if (step === 2 || result.publicSuffix === null) {
        return result;
      }
      result.domain = getDomain$1(result.publicSuffix, result.hostname, options);
      if (step === 3 || result.domain === null) {
        return result;
      }
      result.subdomain = getSubdomain$1(result.hostname, result.domain);
      if (step === 4) {
        return result;
      }
      result.domainWithoutSuffix = getDomainWithoutSuffix$1(result.domain, result.publicSuffix);
      return result;
    }
    function fastPathLookup(hostname, options, out) {
      if (!options.allowPrivateDomains && hostname.length > 3) {
        const last = hostname.length - 1;
        const c3 = hostname.charCodeAt(last);
        const c2 = hostname.charCodeAt(last - 1);
        const c1 = hostname.charCodeAt(last - 2);
        const c0 = hostname.charCodeAt(last - 3);
        if (c3 === 109 && c2 === 111 && c1 === 99 && c0 === 46) {
          out.isIcann = true;
          out.isPrivate = false;
          out.publicSuffix = "com";
          return true;
        } else if (c3 === 103 && c2 === 114 && c1 === 111 && c0 === 46) {
          out.isIcann = true;
          out.isPrivate = false;
          out.publicSuffix = "org";
          return true;
        } else if (c3 === 117 && c2 === 100 && c1 === 101 && c0 === 46) {
          out.isIcann = true;
          out.isPrivate = false;
          out.publicSuffix = "edu";
          return true;
        } else if (c3 === 118 && c2 === 111 && c1 === 103 && c0 === 46) {
          out.isIcann = true;
          out.isPrivate = false;
          out.publicSuffix = "gov";
          return true;
        } else if (c3 === 116 && c2 === 101 && c1 === 110 && c0 === 46) {
          out.isIcann = true;
          out.isPrivate = false;
          out.publicSuffix = "net";
          return true;
        } else if (c3 === 101 && c2 === 100 && c1 === 46) {
          out.isIcann = true;
          out.isPrivate = false;
          out.publicSuffix = "de";
          return true;
        }
      }
      return false;
    }
    var nodeFlags = /* @__PURE__ */ new Uint8Array([1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 2, 2, 0, 2, 2, 0, 2, 0, 0, 1, 0, 0, 2, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 2, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 2, 2, 0, 0, 0, 2, 0, 1, 1, 0, 2, 0, 2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 2, 2, 0, 2, 2, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 2, 2, 0, 2, 2, 2, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 2, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 2, 2, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0]);
    var edgeStart = /* @__PURE__ */ new Uint16Array([0, 0, 0, 10, 11, 18, 106, 111, 117, 124, 130, 136, 145, 146, 147, 148, 149, 150, 151, 153, 154, 155, 157, 159, 228, 241, 243, 244, 245, 260, 267, 268, 271, 272, 273, 276, 278, 297, 298, 300, 309, 314, 331, 332, 335, 337, 338, 340, 374, 375, 377, 380, 381, 385, 387, 391, 394, 426, 429, 442, 443, 451, 452, 454, 464, 478, 479, 480, 481, 490, 491, 528, 533, 549, 569, 575, 617, 618, 645, 672, 673, 821, 827, 830, 831, 832, 837, 842, 851, 873, 874, 875, 876, 877, 878, 879, 897, 899, 900, 903, 905, 906, 908, 910, 925, 940, 945, 946, 948, 949, 950, 951, 952, 954, 957, 962, 963, 964, 966, 967, 970, 973, 974, 975, 988, 990, 1002, 1013, 1021, 1023, 1064, 1067, 1071, 1072, 1074, 1077, 1088, 1090, 1100, 1102, 1108, 1110, 1111, 1113, 1116, 1117, 1118, 1171, 1173, 1175, 1195, 1196, 1197, 1198, 1200, 1211, 1242, 1253, 1265, 1274, 1281, 1286, 1299, 1310, 1323, 1324, 1335, 1369, 1370, 1371, 1386, 1401, 1473, 1474, 1476, 1477, 1513, 1532, 1533, 1534, 1535, 1536, 1539, 1543, 1546, 1548, 1582, 1583, 1591, 1592, 1593, 1594, 1596, 1598, 1599, 1601, 1602, 1603, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1621, 1622, 1623, 1624, 1625, 1626, 1627, 1629, 1630, 1631, 2086, 2089, 2090, 2092, 2099, 2106, 2116, 2120, 2131, 2132, 2133, 2145, 2146, 2148, 2150, 2151, 2158, 2159, 2161, 2162, 2164, 2165, 2166, 2167, 2168, 2242, 2244, 2265, 2266, 2267, 2269, 2271, 2272, 2323, 2324, 2326, 2333, 2339, 2349, 2359, 2412, 2413, 2414, 2424, 2438, 2439, 2442, 2449, 2450, 2458, 2459, 2460, 2461, 2462, 2473, 2474, 2475, 2477, 2478, 2479, 2488, 2500, 2506, 2538, 2542, 2544, 2545, 2547, 2548, 2559, 2560, 2562, 2570, 2577, 2583, 2588, 2589, 2595, 2598, 2604, 2611, 2612, 2619, 2627, 2628, 2629, 2667, 2673, 2688, 2689, 2694, 2712, 2743, 2761, 2763, 2766, 2774, 2776, 2783, 2835, 2859, 2860, 2861, 2862, 2863, 2864, 2865, 2872, 2873, 2874, 2875, 2876, 2877, 2879, 2880, 2884, 2964, 2977, 2978, 3415, 3419, 3433, 3485, 3513, 3535, 3593, 3615, 3630, 3693, 3744, 3782, 3818, 3843, 3985, 4031, 4082, 4101, 4135, 4150, 4170, 4200, 4231, 4254, 4285, 4315, 4347, 4374, 4449, 4471, 4509, 4519, 4553, 4572, 4598, 4640, 4690, 4716, 4785, 4786, 4788, 4811, 4834, 4870, 4901, 4918, 4975, 4988, 5012, 5041, 5043, 5077, 5093, 5121, 5426, 5435, 5444, 5451, 5468, 5472, 5478, 5517, 5519, 5526, 5533, 5542, 5549, 5550, 5551, 5563, 5566, 5581, 5582, 5591, 5592, 5601, 5610, 5616, 5618, 5619, 5620, 5657, 5658, 5660, 5668, 5675, 5688, 5692, 5694, 5695, 5701, 5708, 5722, 5732, 5737, 5745, 5753, 5759, 5760, 5764, 5766, 5767, 5779, 5851, 5852, 5853, 5854, 5856, 5857, 5860, 5862, 5865, 5869, 5870, 5871, 5877, 5878, 5879, 5881, 5883, 5885, 5886, 5887, 5890, 5892, 5895, 5896, 5898, 6096, 6103, 6104, 6105, 6115, 6120, 6137, 6151, 6160, 6161, 6162, 6166, 6167, 6169, 6171, 6177, 6178, 6181, 6182, 6184, 6185, 6186, 7086, 7089, 7093, 7111, 7120, 7123, 7130, 7131, 7133, 7134, 7135, 7137, 7189, 7190, 7193, 7194, 7311, 7312, 7323, 7334, 7341, 7344, 7353, 7354, 7355, 7370, 7425, 7617, 7619, 7620, 7622, 7627, 7640, 7655, 7662, 7671, 7674, 7677, 7684, 7692, 7696, 7697, 7698, 7712, 7716, 7725, 7726, 7727, 7731, 7766, 7767, 7785, 7792, 7800, 7801, 7806, 7814, 7858, 7859, 7865, 7868, 7880, 7885, 7886, 7889, 7891, 7926, 7927, 7933, 7940, 7941, 7950, 7959, 7974, 7978, 7979, 8031, 8032, 8037, 8039, 8042, 8044, 8045, 8046, 8055, 8069, 8077, 8091, 8103, 8104, 8106, 8108, 8130, 8141, 8147, 8148, 8160, 8172, 8259, 8271, 8279, 8282, 8288, 8313, 8316, 8317, 8318, 8319, 8321, 8324, 8327, 8338, 8340, 8342, 8370, 8445, 8452, 8456, 8457, 8466, 8488, 8489, 8494, 8495, 8574, 8576, 8578, 8587, 8591, 8597, 8603, 8609, 8619, 8624, 8625, 8643, 8654, 8659, 8664, 8674, 8680, 8684, 8690, 8696, 10304, 10305, 10306, 10313, 10315]);
    var edgeLength = /* @__PURE__ */ new Uint8Array([3, 3, 3, 3, 3, 3, 3, 3, 5, 8, 8, 2, 2, 3, 3, 3, 3, 3, 8, 5, 5, 5, 5, 5, 3, 3, 5, 5, 9, 12, 19, 8, 19, 8, 11, 9, 9, 8, 7, 7, 6, 8, 9, 16, 10, 7, 7, 11, 8, 6, 6, 9, 7, 11, 7, 14, 4, 4, 4, 4, 4, 4, 10, 7, 6, 6, 6, 6, 10, 10, 6, 10, 10, 22, 11, 9, 10, 10, 10, 9, 10, 8, 7, 7, 7, 8, 21, 13, 11, 11, 9, 10, 9, 13, 10, 8, 8, 9, 12, 9, 7, 10, 7, 7, 13, 7, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 6, 3, 3, 3, 3, 3, 3, 2, 5, 3, 3, 3, 7, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 1, 7, 8, 5, 2, 2, 7, 2, 2, 1, 4, 1, 11, 9, 9, 5, 5, 8, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 3, 3, 5, 11, 9, 9, 13, 7, 14, 7, 6, 6, 6, 7, 6, 6, 6, 6, 6, 6, 10, 7, 11, 9, 4, 4, 4, 4, 4, 6, 6, 6, 6, 13, 6, 8, 7, 10, 9, 9, 7, 9, 8, 9, 8, 7, 10, 6, 9, 8, 10, 10, 7, 8, 1, 9, 10, 12, 12, 12, 10, 9, 9, 10, 10, 9, 9, 1, 1, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 4, 3, 3, 3, 7, 4, 4, 4, 3, 3, 6, 7, 3, 4, 1, 2, 2, 2, 6, 1, 2, 2, 2, 2, 2, 12, 5, 3, 8, 9, 13, 4, 4, 13, 9, 9, 11, 7, 3, 12, 9, 2, 2, 2, 3, 3, 3, 3, 3, 8, 2, 2, 3, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 7, 10, 15, 7, 15, 15, 20, 15, 9, 10, 10, 12, 14, 14, 14, 12, 12, 12, 12, 12, 14, 14, 10, 10, 10, 10, 14, 9, 9, 9, 10, 14, 14, 14, 13, 13, 9, 9, 9, 9, 9, 9, 7, 8, 6, 8, 8, 6, 8, 13, 8, 8, 6, 13, 8, 11, 13, 8, 6, 13, 8, 6, 9, 10, 10, 12, 14, 14, 14, 12, 12, 12, 12, 14, 14, 10, 10, 10, 10, 9, 9, 9, 10, 14, 14, 11, 13, 13, 9, 9, 9, 9, 9, 9, 2, 6, 9, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 2, 3, 3, 3, 3, 3, 3, 7, 7, 2, 3, 2, 2, 5, 3, 3, 3, 3, 3, 3, 4, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 5, 7, 4, 2, 2, 12, 8, 10, 8, 10, 7, 18, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 2, 2, 3, 3, 3, 5, 5, 3, 8, 8, 6, 8, 6, 6, 4, 6, 7, 7, 7, 10, 11, 2, 5, 5, 3, 3, 3, 3, 3, 3, 5, 5, 6, 11, 10, 7, 7, 7, 4, 4, 4, 2, 3, 3, 3, 3, 3, 2, 2, 7, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 7, 7, 7, 11, 7, 6, 9, 6, 6, 8, 10, 8, 6, 8, 13, 4, 4, 4, 4, 4, 10, 8, 11, 8, 8, 8, 10, 10, 7, 10, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 10, 13, 7, 8, 7, 11, 8, 8, 6, 9, 8, 8, 6, 6, 6, 8, 8, 6, 6, 6, 6, 6, 9, 7, 6, 4, 4, 4, 4, 4, 4, 4, 6, 6, 6, 9, 7, 8, 10, 8, 8, 2, 3, 3, 3, 3, 3, 2, 8, 9, 9, 2, 2, 2, 3, 3, 3, 2, 3, 3, 3, 9, 2, 2, 3, 3, 3, 3, 3, 3, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 12, 5, 5, 3, 5, 4, 2, 3, 2, 4, 3, 9, 2, 2, 2, 2, 2, 5, 5, 3, 8, 8, 13, 6, 10, 9, 4, 7, 9, 11, 2, 3, 7, 3, 3, 4, 1, 3, 4, 2, 9, 3, 3, 12, 5, 3, 7, 10, 10, 7, 4, 4, 6, 14, 7, 9, 7, 13, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 8, 15, 4, 4, 2, 3, 3, 3, 7, 4, 9, 9, 2, 3, 3, 3, 5, 3, 2, 2, 7, 2, 7, 6, 6, 7, 2, 4, 2, 2, 2, 2, 2, 2, 8, 8, 8, 9, 5, 2, 3, 3, 3, 3, 3, 3, 10, 7, 4, 4, 4, 4, 3, 4, 2, 3, 3, 3, 3, 3, 10, 7, 4, 4, 4, 4, 2, 3, 3, 3, 3, 10, 7, 4, 4, 4, 4, 3, 9, 6, 6, 6, 9, 13, 9, 2, 2, 2, 8, 7, 9, 5, 3, 3, 3, 5, 5, 13, 12, 9, 10, 7, 8, 7, 6, 8, 6, 11, 12, 7, 9, 10, 4, 4, 7, 8, 11, 6, 7, 9, 8, 7, 10, 8, 9, 15, 7, 8, 5, 4, 7, 2, 3, 3, 3, 2, 14, 10, 2, 14, 10, 2, 14, 3, 9, 13, 13, 10, 14, 16, 17, 11, 2, 14, 2, 14, 3, 9, 13, 10, 14, 16, 17, 11, 14, 10, 14, 2, 7, 3, 10, 7, 14, 10, 2, 14, 10, 9, 9, 17, 6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 10, 10, 10, 12, 9, 4, 10, 10, 11, 8, 8, 8, 7, 9, 5, 3, 3, 3, 3, 3, 3, 3, 3, 5, 8, 4, 4, 4, 4, 4, 4, 6, 16, 3, 3, 14, 3, 14, 2, 14, 9, 13, 10, 10, 14, 16, 17, 11, 6, 9, 10, 10, 12, 14, 14, 14, 12, 12, 12, 12, 14, 14, 10, 10, 10, 10, 14, 9, 9, 9, 10, 14, 14, 14, 9, 9, 9, 9, 9, 9, 2, 14, 9, 13, 10, 10, 14, 16, 17, 11, 6, 2, 14, 9, 17, 13, 10, 10, 14, 16, 17, 11, 6, 2, 14, 9, 13, 10, 14, 16, 17, 11, 2, 14, 9, 13, 10, 16, 11, 2, 14, 10, 19, 7, 2, 14, 9, 13, 10, 19, 10, 7, 14, 16, 17, 11, 6, 2, 14, 9, 13, 10, 19, 7, 14, 16, 17, 11, 2, 14, 9, 13, 17, 13, 10, 10, 14, 16, 17, 11, 6, 3, 2, 14, 9, 13, 10, 10, 14, 16, 17, 11, 6, 9, 10, 12, 14, 14, 14, 12, 12, 12, 12, 12, 14, 14, 14, 10, 10, 10, 14, 9, 9, 9, 9, 14, 14, 14, 13, 13, 14, 9, 9, 9, 9, 9, 9, 4, 11, 2, 14, 9, 13, 17, 13, 10, 19, 10, 7, 14, 16, 17, 11, 6, 2, 14, 9, 13, 17, 13, 10, 19, 10, 7, 14, 16, 17, 11, 6, 2, 9, 10, 10, 7, 17, 3, 3, 12, 12, 16, 15, 15, 12, 14, 14, 14, 20, 20, 13, 12, 12, 12, 12, 12, 12, 20, 25, 14, 14, 12, 12, 10, 10, 10, 10, 9, 9, 9, 25, 4, 9, 17, 10, 7, 14, 16, 21, 13, 13, 14, 20, 14, 13, 17, 24, 9, 12, 13, 25, 13, 21, 20, 17, 9, 9, 9, 9, 9, 9, 12, 17, 4, 4, 9, 9, 9, 10, 10, 12, 14, 14, 14, 12, 12, 12, 12, 12, 14, 14, 10, 10, 10, 10, 14, 9, 9, 9, 9, 10, 14, 14, 14, 13, 13, 14, 9, 9, 9, 9, 9, 9, 9, 10, 14, 12, 12, 14, 14, 10, 9, 9, 9, 10, 14, 14, 14, 9, 9, 9, 9, 2, 1, 5, 8, 7, 11, 11, 1, 3, 3, 3, 5, 3, 3, 4, 8, 9, 10, 10, 12, 14, 14, 14, 12, 12, 12, 12, 14, 14, 10, 10, 10, 10, 14, 9, 9, 9, 10, 14, 14, 14, 13, 13, 14, 9, 9, 9, 9, 9, 9, 7, 4, 4, 4, 4, 4, 4, 4, 4, 4, 7, 4, 9, 12, 6, 14, 4, 12, 7, 2, 2, 1, 2, 7, 6, 4, 4, 4, 6, 8, 8, 7, 4, 5, 6, 3, 3, 3, 3, 4, 16, 8, 5, 4, 3, 3, 3, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 11, 12, 7, 7, 13, 9, 10, 17, 12, 8, 9, 7, 8, 5, 12, 10, 13, 14, 5, 5, 5, 13, 5, 5, 5, 3, 3, 3, 5, 16, 5, 5, 5, 5, 7, 12, 14, 8, 12, 8, 10, 12, 9, 11, 7, 9, 7, 10, 7, 13, 9, 7, 12, 8, 17, 7, 7, 16, 10, 13, 13, 8, 10, 10, 14, 17, 7, 16, 16, 15, 8, 10, 10, 12, 17, 17, 7, 17, 14, 7, 10, 17, 8, 7, 7, 7, 8, 15, 15, 7, 14, 10, 10, 10, 11, 11, 7, 7, 13, 8, 10, 7, 16, 7, 8, 7, 14, 17, 12, 10, 11, 21, 8, 9, 7, 13, 9, 8, 13, 6, 12, 7, 6, 13, 10, 10, 10, 8, 18, 9, 17, 13, 10, 12, 6, 13, 6, 11, 8, 13, 10, 13, 18, 13, 11, 13, 8, 16, 7, 10, 8, 16, 12, 10, 8, 8, 14, 11, 8, 15, 8, 8, 7, 7, 12, 7, 8, 9, 14, 15, 8, 9, 10, 9, 15, 7, 8, 8, 12, 13, 9, 10, 15, 13, 7, 10, 10, 20, 7, 6, 9, 6, 6, 14, 11, 14, 11, 12, 9, 10, 16, 16, 12, 7, 11, 28, 8, 11, 10, 7, 21, 8, 7, 9, 4, 4, 4, 17, 7, 8, 6, 9, 6, 6, 13, 6, 6, 6, 6, 18, 20, 14, 8, 11, 12, 9, 10, 13, 15, 15, 19, 8, 9, 12, 7, 10, 16, 12, 9, 9, 9, 14, 12, 11, 9, 12, 11, 18, 9, 9, 9, 10, 7, 7, 16, 8, 9, 7, 13, 12, 10, 14, 18, 7, 8, 11, 7, 7, 8, 8, 13, 7, 7, 7, 11, 15, 13, 11, 7, 8, 15, 11, 7, 8, 18, 14, 13, 18, 15, 10, 12, 12, 9, 7, 11, 11, 8, 7, 10, 8, 14, 12, 10, 18, 7, 10, 9, 7, 8, 13, 10, 14, 10, 8, 8, 23, 7, 7, 11, 12, 12, 17, 7, 7, 11, 11, 17, 16, 16, 7, 8, 11, 14, 14, 8, 10, 7, 7, 16, 16, 13, 9, 11, 9, 15, 15, 11, 11, 7, 7, 14, 7, 9, 7, 7, 16, 10, 13, 10, 11, 14, 7, 11, 10, 11, 7, 11, 10, 11, 15, 11, 15, 10, 12, 10, 14, 13, 11, 11, 12, 13, 10, 7, 13, 10, 16, 12, 21, 15, 9, 10, 10, 7, 11, 14, 17, 7, 7, 8, 11, 12, 8, 15, 14, 14, 8, 17, 12, 10, 10, 7, 9, 11, 7, 10, 7, 11, 18, 7, 11, 7, 12, 11, 8, 8, 14, 12, 7, 8, 15, 3, 7, 7, 5, 2, 9, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 2, 5, 3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 3, 3, 3, 5, 11, 6, 4, 7, 10, 7, 7, 11, 1, 10, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 5, 7, 3, 5, 6, 3, 3, 5, 2, 2, 5, 3, 4, 13, 11, 3, 3, 6, 3, 5, 14, 2, 2, 3, 8, 2, 2, 12, 5, 18, 5, 3, 3, 3, 16, 5, 5, 5, 10, 7, 13, 12, 13, 9, 12, 14, 19, 9, 9, 21, 9, 9, 10, 6, 9, 6, 15, 10, 6, 12, 8, 6, 10, 15, 4, 4, 6, 6, 9, 9, 12, 16, 14, 23, 7, 7, 7, 14, 9, 7, 7, 11, 14, 10, 7, 10, 10, 10, 12, 6, 11, 10, 13, 11, 15, 11, 7, 12, 10, 3, 7, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 4, 3, 7, 1, 5, 2, 2, 2, 5, 5, 5, 5, 3, 3, 3, 3, 3, 5, 5, 10, 9, 11, 8, 7, 12, 8, 9, 7, 6, 13, 11, 6, 13, 7, 9, 9, 4, 4, 4, 4, 4, 6, 10, 7, 8, 13, 8, 8, 9, 14, 7, 8, 10, 7, 7, 7, 9, 6, 9, 7, 2, 12, 5, 3, 3, 13, 4, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 5, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 9, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 2, 2, 2, 5, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 1, 7, 6, 4, 12, 3, 3, 3, 3, 3, 8, 7, 3, 3, 3, 3, 3, 3, 4, 4, 11, 14, 2, 8, 3, 5, 5, 8, 10, 8, 6, 4, 7, 17, 7, 4, 5, 2, 6, 3, 2, 2, 12, 5, 5, 3, 15, 13, 8, 11, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 5, 3, 3, 3, 3, 4, 18, 2, 12, 5, 3, 3, 3, 3, 3, 5, 16, 8, 8, 9, 6, 6, 4, 4, 4, 4, 31, 6, 6, 10, 11, 21, 10, 9, 7, 10, 7, 7, 2, 4, 4, 4, 4, 6, 5, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 2, 2, 2, 5, 3, 3, 3, 7, 7, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 8, 2, 3, 3, 3, 3, 3, 5, 9, 11, 3, 3, 3, 3, 4, 4, 3, 3, 3, 3, 3, 5, 10, 9, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 11, 10, 10, 10, 10, 10, 11, 10, 11, 10, 11, 10, 9, 9, 11, 3, 3, 3, 3, 3, 3, 5, 3, 7, 8, 8, 7, 6, 6, 11, 4, 4, 4, 7, 8, 9, 9, 2, 3, 7, 4, 4, 2, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 2, 2, 5, 5, 5, 5, 5, 3, 3, 5, 5, 5, 7, 7, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 6, 6, 8, 8, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 6, 9, 12, 3, 7, 10, 7, 2, 2, 3, 3, 3, 3, 3, 4, 3, 3, 2, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 8, 8, 6, 6, 8, 6, 7, 4, 4, 4, 4, 4, 4, 6, 7, 5, 5, 20, 19, 8, 10, 9, 7, 10, 6, 8, 11, 6, 6, 6, 6, 13, 12, 8, 6, 7, 14, 11, 9, 2, 5, 3, 6, 2, 3, 2, 2, 2, 2, 2, 2, 2, 5, 4, 3, 7, 6, 4, 7, 4, 3, 6, 4, 7, 2, 7, 7, 7, 5, 5, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 9, 10, 10, 11, 7, 8, 20, 7, 8, 9, 8, 12, 6, 6, 6, 8, 9, 8, 12, 6, 6, 8, 13, 10, 12, 6, 6, 7, 7, 9, 6, 4, 4, 4, 4, 4, 4, 10, 6, 6, 6, 7, 14, 11, 10, 7, 8, 10, 8, 11, 14, 11, 11, 9, 7, 9, 8, 11, 9, 17, 10, 9, 2, 2, 2, 9, 3, 3, 3, 3, 15, 14, 9, 5, 5, 2, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 15, 12, 22, 19, 17, 18, 18, 19, 21, 7, 16, 16, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 7, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 9, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 7, 16, 11, 11, 7, 7, 7, 7, 17, 7, 8, 12, 15, 9, 19, 7, 19, 8, 21, 11, 12, 19, 14, 22, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 16, 16, 19, 24, 12, 7, 14, 7, 12, 7, 8, 10, 10, 13, 7, 12, 12, 7, 7, 10, 18, 15, 12, 16, 7, 14, 12, 17, 10, 16, 17, 12, 17, 25, 7, 7, 7, 13, 6, 9, 6, 9, 18, 6, 6, 11, 20, 10, 6, 6, 6, 6, 6, 6, 17, 6, 6, 6, 15, 6, 6, 6, 6, 6, 8, 14, 11, 12, 11, 15, 13, 19, 17, 21, 7, 18, 8, 13, 13, 8, 12, 8, 6, 6, 13, 6, 15, 15, 16, 6, 6, 16, 6, 6, 6, 14, 6, 18, 6, 6, 6, 17, 18, 9, 13, 15, 8, 19, 8, 15, 15, 18, 14, 16, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 6, 11, 10, 11, 6, 21, 23, 12, 17, 12, 11, 14, 13, 22, 15, 15, 11, 12, 14, 12, 7, 12, 8, 12, 14, 12, 18, 10, 8, 16, 19, 17, 12, 14, 15, 8, 19, 17, 12, 13, 13, 15, 18, 13, 23, 24, 23, 21, 17, 24, 8, 21, 8, 14, 14, 16, 20, 14, 8, 8, 15, 20, 8, 19, 21, 9, 8, 13, 12, 13, 15, 11, 8, 11, 9, 9, 8, 11, 8, 21, 14, 21, 15, 15, 13, 7, 19, 7, 7, 7, 7, 7, 7, 16, 12, 17, 18, 7, 7, 11, 11, 7, 9, 9, 2, 2, 3, 3, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 10, 10, 7, 9, 7, 7, 7, 6, 8, 6, 6, 6, 6, 6, 6, 6, 7, 6, 8, 6, 6, 9, 7, 7, 7, 4, 4, 4, 4, 4, 4, 4, 4, 8, 9, 8, 7, 8, 7, 8, 10, 7, 5, 5, 5, 5, 5, 5, 3, 9, 7, 7, 8, 6, 6, 6, 6, 6, 6, 6, 6, 9, 6, 6, 9, 11, 13, 7, 8, 9, 9, 5, 5, 5, 7, 8, 6, 6, 6, 6, 6, 6, 6, 7, 8, 9, 7, 10, 9, 10, 7, 8, 5, 5, 5, 5, 5, 5, 7, 7, 9, 8, 7, 7, 6, 6, 6, 6, 6, 6, 10, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 9, 10, 4, 4, 4, 4, 8, 7, 7, 10, 10, 9, 8, 8, 15, 9, 8, 8, 8, 8, 8, 9, 10, 9, 10, 7, 8, 13, 5, 5, 5, 5, 5, 3, 3, 7, 7, 8, 6, 6, 6, 4, 4, 11, 9, 7, 8, 9, 10, 7, 5, 5, 5, 5, 5, 3, 3, 7, 6, 6, 13, 7, 9, 8, 7, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 3, 7, 8, 7, 8, 13, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8, 8, 6, 6, 6, 6, 7, 6, 7, 6, 6, 9, 7, 4, 4, 4, 4, 4, 4, 4, 7, 8, 7, 8, 9, 8, 8, 8, 7, 10, 7, 8, 5, 5, 5, 5, 5, 5, 5, 5, 3, 7, 7, 7, 7, 9, 7, 10, 9, 6, 6, 6, 6, 6, 8, 8, 6, 6, 6, 7, 6, 6, 6, 9, 9, 4, 4, 13, 7, 10, 9, 9, 12, 7, 8, 8, 10, 8, 8, 8, 8, 8, 8, 5, 5, 5, 5, 3, 7, 7, 11, 7, 9, 8, 8, 6, 6, 10, 6, 8, 8, 8, 6, 7, 6, 6, 12, 4, 4, 4, 4, 4, 4, 4, 4, 4, 9, 8, 8, 16, 8, 9, 8, 7, 5, 5, 5, 5, 5, 3, 3, 7, 7, 7, 10, 15, 8, 9, 8, 9, 9, 6, 6, 6, 6, 6, 6, 7, 4, 8, 7, 8, 8, 7, 8, 11, 8, 5, 5, 5, 5, 5, 3, 7, 7, 6, 11, 16, 7, 6, 4, 4, 4, 4, 9, 9, 8, 8, 8, 13, 12, 8, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 11, 7, 8, 8, 9, 13, 7, 7, 7, 9, 8, 8, 9, 12, 7, 12, 7, 12, 8, 7, 10, 12, 9, 9, 6, 6, 8, 8, 6, 6, 6, 6, 6, 6, 6, 9, 8, 9, 11, 8, 6, 6, 6, 6, 6, 12, 7, 6, 6, 6, 9, 7, 7, 6, 6, 6, 6, 6, 11, 9, 6, 6, 6, 6, 6, 7, 9, 4, 4, 4, 4, 4, 4, 4, 4, 9, 9, 9, 9, 7, 7, 7, 7, 7, 11, 7, 7, 8, 8, 8, 8, 8, 8, 9, 8, 9, 9, 7, 7, 11, 11, 7, 12, 8, 8, 8, 8, 8, 7, 8, 8, 8, 8, 8, 13, 12, 8, 8, 8, 8, 7, 7, 7, 9, 5, 5, 5, 5, 5, 5, 5, 3, 3, 7, 7, 11, 7, 8, 8, 8, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 10, 11, 6, 7, 9, 4, 4, 4, 4, 4, 4, 9, 9, 8, 9, 8, 8, 8, 7, 7, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 11, 7, 7, 7, 9, 6, 6, 11, 8, 10, 6, 6, 6, 12, 8, 8, 7, 6, 6, 8, 7, 4, 4, 4, 4, 4, 4, 4, 4, 9, 10, 9, 9, 8, 10, 9, 11, 8, 5, 5, 5, 7, 6, 6, 8, 7, 4, 4, 4, 4, 8, 7, 7, 8, 7, 8, 8, 5, 5, 5, 5, 7, 7, 8, 8, 8, 6, 6, 6, 6, 6, 10, 8, 9, 13, 6, 7, 6, 6, 8, 7, 8, 4, 4, 4, 4, 11, 8, 8, 8, 10, 5, 5, 8, 7, 8, 13, 8, 7, 6, 8, 6, 9, 7, 8, 7, 5, 5, 5, 5, 5, 5, 3, 3, 7, 8, 9, 6, 4, 8, 10, 10, 8, 12, 9, 13, 2, 7, 5, 5, 5, 5, 5, 7, 7, 10, 6, 6, 6, 6, 6, 6, 6, 8, 4, 4, 9, 8, 8, 8, 14, 8, 8, 8, 9, 8, 5, 5, 5, 5, 5, 3, 3, 9, 6, 6, 6, 6, 10, 12, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 11, 8, 7, 8, 8, 8, 5, 5, 3, 3, 3, 3, 7, 7, 6, 8, 6, 8, 11, 7, 6, 6, 6, 7, 4, 8, 11, 9, 10, 5, 5, 5, 3, 3, 3, 7, 7, 8, 9, 8, 15, 9, 6, 6, 6, 6, 6, 6, 11, 11, 4, 4, 4, 4, 4, 7, 9, 9, 10, 8, 7, 5, 5, 5, 5, 5, 5, 3, 3, 8, 6, 6, 6, 6, 6, 6, 6, 6, 6, 9, 7, 4, 4, 4, 4, 4, 9, 9, 8, 8, 10, 13, 5, 5, 5, 3, 17, 7, 7, 7, 7, 7, 8, 6, 8, 13, 6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 9, 10, 8, 8, 8, 5, 5, 5, 5, 3, 7, 7, 7, 8, 8, 6, 6, 6, 8, 8, 8, 9, 10, 8, 4, 8, 10, 9, 8, 8, 8, 9, 13, 10, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 7, 8, 9, 9, 7, 7, 7, 10, 9, 9, 8, 9, 8, 8, 8, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8, 12, 6, 6, 6, 6, 6, 6, 6, 6, 6, 12, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 11, 8, 8, 9, 9, 10, 8, 9, 7, 7, 5, 5, 5, 5, 5, 5, 3, 7, 8, 7, 6, 6, 8, 6, 6, 10, 4, 7, 8, 9, 12, 8, 7, 7, 5, 5, 5, 5, 5, 5, 3, 3, 7, 14, 7, 9, 8, 8, 6, 6, 8, 12, 12, 6, 6, 7, 7, 10, 4, 4, 4, 4, 4, 9, 9, 14, 9, 13, 8, 7, 5, 5, 5, 6, 6, 6, 7, 4, 8, 7, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 7, 7, 7, 8, 6, 6, 6, 6, 6, 6, 12, 6, 6, 6, 6, 4, 4, 9, 9, 8, 8, 11, 7, 7, 7, 5, 5, 5, 3, 9, 8, 6, 6, 7, 4, 4, 4, 4, 4, 4, 8, 8, 11, 5, 5, 5, 7, 7, 7, 9, 6, 6, 6, 6, 6, 6, 9, 8, 4, 4, 4, 4, 7, 12, 9, 8, 8, 8, 7, 10, 10, 5, 5, 5, 5, 5, 5, 5, 3, 11, 14, 8, 7, 8, 8, 6, 6, 6, 6, 6, 8, 7, 6, 6, 6, 7, 6, 8, 9, 4, 4, 4, 7, 8, 9, 7, 9, 7, 7, 9, 8, 5, 5, 5, 5, 5, 5, 5, 5, 5, 11, 3, 9, 7, 7, 12, 14, 8, 6, 6, 12, 11, 8, 6, 6, 6, 6, 6, 6, 6, 6, 6, 15, 7, 4, 4, 4, 16, 9, 9, 9, 8, 9, 9, 9, 9, 9, 8, 8, 8, 13, 11, 8, 5, 5, 5, 5, 3, 7, 6, 6, 8, 8, 8, 6, 6, 7, 10, 7, 4, 4, 4, 4, 9, 7, 8, 7, 7, 7, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 7, 7, 7, 9, 6, 6, 6, 6, 6, 8, 8, 7, 7, 9, 6, 6, 6, 7, 6, 6, 6, 6, 6, 15, 4, 4, 4, 4, 4, 8, 8, 7, 8, 12, 9, 8, 8, 8, 8, 8, 9, 8, 8, 10, 8, 8, 8, 8, 16, 9, 10, 2, 5, 5, 5, 5, 5, 5, 5, 9, 7, 6, 8, 9, 4, 4, 4, 4, 4, 7, 8, 8, 8, 9, 8, 11, 10, 5, 5, 5, 5, 3, 7, 8, 6, 6, 6, 6, 6, 8, 6, 6, 6, 6, 4, 12, 10, 12, 7, 7, 7, 7, 7, 7, 7, 5, 5, 5, 5, 3, 3, 7, 7, 10, 8, 9, 7, 6, 10, 7, 6, 6, 4, 4, 8, 9, 7, 9, 9, 9, 9, 8, 8, 8, 8, 10, 5, 5, 5, 5, 5, 5, 8, 7, 6, 6, 6, 10, 6, 7, 10, 7, 4, 4, 4, 4, 4, 4, 4, 12, 9, 10, 7, 7, 10, 8, 10, 5, 12, 9, 6, 6, 6, 6, 6, 7, 6, 4, 4, 4, 10, 9, 9, 8, 7, 7, 5, 5, 5, 5, 5, 5, 3, 3, 13, 7, 7, 9, 7, 7, 7, 8, 9, 9, 7, 8, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 13, 9, 15, 15, 4, 4, 4, 4, 4, 10, 10, 9, 8, 9, 8, 8, 9, 7, 8, 7, 8, 5, 5, 7, 6, 6, 6, 4, 4, 4, 7, 8, 11, 8, 5, 5, 5, 5, 5, 5, 5, 7, 6, 6, 6, 6, 6, 6, 9, 11, 10, 7, 4, 4, 4, 9, 8, 8, 5, 5, 5, 5, 5, 9, 9, 6, 6, 6, 6, 6, 6, 6, 9, 9, 4, 4, 4, 4, 8, 8, 8, 9, 9, 8, 8, 8, 13, 2, 4, 2, 7, 5, 5, 5, 5, 5, 5, 9, 9, 6, 6, 6, 6, 10, 8, 8, 8, 6, 6, 6, 4, 4, 9, 8, 10, 8, 9, 8, 8, 8, 9, 8, 8, 5, 3, 3, 3, 11, 6, 6, 6, 7, 6, 6, 6, 4, 4, 9, 8, 5, 5, 5, 5, 5, 3, 11, 8, 6, 6, 6, 6, 6, 9, 7, 4, 4, 14, 10, 9, 8, 12, 8, 8, 8, 11, 15, 8, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 11, 11, 11, 10, 10, 7, 7, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 7, 11, 7, 7, 11, 11, 7, 8, 9, 10, 7, 7, 9, 9, 9, 9, 7, 7, 10, 8, 13, 8, 8, 8, 8, 11, 10, 6, 6, 8, 10, 11, 14, 14, 6, 6, 6, 6, 6, 6, 9, 11, 7, 7, 6, 8, 12, 11, 11, 6, 6, 10, 6, 6, 6, 6, 6, 10, 7, 7, 6, 6, 11, 6, 6, 6, 11, 8, 9, 7, 6, 10, 11, 9, 10, 11, 7, 11, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 8, 6, 6, 8, 9, 10, 9, 6, 6, 6, 10, 6, 6, 6, 6, 11, 10, 11, 10, 9, 8, 7, 7, 7, 7, 11, 14, 8, 10, 9, 9, 8, 8, 7, 11, 8, 8, 8, 11, 11, 10, 10, 9, 10, 8, 11, 10, 8, 11, 9, 12, 8, 10, 8, 11, 8, 9, 9, 11, 11, 10, 11, 13, 8, 7, 8, 8, 9, 7, 8, 8, 8, 8, 7, 8, 2, 2, 2, 2, 2, 2, 2, 4, 4, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 2, 3, 3, 3, 3, 3, 3, 3, 3, 8, 6, 4, 4, 4, 11, 7, 11, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 3, 3, 3, 3, 8, 7, 7, 8, 8, 4, 8, 7, 7, 7, 9, 7, 8, 9, 8, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 3, 3, 3, 3, 3, 3, 3, 3, 4, 2, 2, 3, 3, 3, 3, 3, 3, 4, 5, 5, 3, 3, 8, 8, 6, 9, 4, 4, 10, 7, 3, 3, 3, 2, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 2, 2, 2, 3, 3, 3, 3, 3, 4, 10, 2, 3, 3, 3, 3, 3, 3, 3, 4, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 3, 3, 3, 5, 2, 4, 2, 6, 2, 2, 9, 5, 5, 3, 3, 3, 3, 3, 3, 3, 5, 5, 5, 9, 8, 7, 9, 6, 6, 11, 4, 4, 4, 4, 4, 4, 4, 4, 6, 6, 7, 7, 11, 8, 8, 6, 5, 11, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 2, 2, 3, 3, 3, 3, 3, 3, 6, 4, 4, 4, 4, 3, 3, 3, 3, 5, 7, 2, 3, 3, 3, 3, 3, 8, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 4, 4, 4, 4, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 2, 2, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 6, 3, 3, 8, 10, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 8, 9, 10, 7, 7, 1, 14, 18, 13, 18, 13, 10, 10, 16, 13, 18, 16, 13, 16, 18, 13, 22, 16, 16, 16, 14, 21, 16, 9, 14, 16, 9, 9, 14, 10, 10, 14, 12, 14, 19, 12, 11, 18, 13, 17, 15, 15, 15, 15, 16, 14, 13, 19, 18, 15, 19, 18, 12, 18, 12, 11, 20, 14, 15, 10, 17, 17, 16, 19, 20, 21, 15, 13, 16, 15, 15, 15, 1, 1, 3, 8, 7, 7, 8, 8, 8, 1, 6, 1, 1, 6, 3, 3, 4, 7, 3, 3, 5, 5, 4, 4, 4, 4, 4, 2, 7, 7, 8, 12, 3, 4, 5, 1, 3, 4, 4, 10, 4, 3, 3, 3, 8, 7, 7, 2, 2, 2, 2, 2, 2, 2, 2, 2, 12, 9, 20, 7, 5, 5, 5, 9, 13, 5, 5, 5, 5, 5, 3, 3, 3, 16, 5, 5, 5, 13, 7, 8, 8, 11, 8, 7, 9, 7, 11, 12, 9, 9, 8, 8, 11, 10, 14, 7, 12, 10, 11, 13, 7, 9, 11, 17, 17, 14, 13, 7, 8, 7, 10, 10, 7, 16, 13, 7, 8, 17, 12, 9, 8, 6, 7, 10, 6, 6, 12, 6, 8, 10, 8, 8, 8, 6, 8, 6, 14, 6, 6, 6, 13, 6, 10, 6, 6, 7, 14, 8, 6, 6, 10, 11, 10, 9, 9, 7, 7, 6, 6, 6, 9, 9, 7, 9, 10, 9, 13, 12, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 6, 6, 6, 8, 8, 6, 8, 9, 10, 9, 7, 10, 10, 8, 7, 8, 7, 10, 12, 9, 8, 15, 8, 7, 8, 8, 7, 7, 15, 13, 7, 10, 9, 14, 18, 16, 7, 24, 7, 8, 10, 11, 16, 8, 14, 7, 9, 9, 9, 13, 19, 14, 15, 14, 11, 7, 13, 9, 10, 7, 13, 9, 10, 11, 12, 8, 9, 2, 3, 5, 8, 7, 4, 4, 15, 10, 5, 3, 3, 3, 3, 3, 5, 4, 4, 4, 2, 2, 2, 2, 2, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 2, 12, 5, 3, 8, 10, 15, 6, 7, 2, 3, 2, 5, 5, 12, 2, 5, 5, 5, 5, 2, 2, 5, 5, 12, 9, 5, 2, 2, 9, 5, 5, 12, 12, 5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 12, 5, 8, 8, 9, 5, 5, 5, 8, 19, 7, 16, 15, 14, 9, 9, 9, 9, 7, 11, 11, 11, 7, 14, 10, 10, 5, 5, 5, 5, 5, 5, 5, 5, 5, 15, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 9, 9, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 14, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 15, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 12, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 9, 9, 12, 9, 9, 12, 12, 12, 15, 7, 11, 7, 14, 11, 18, 13, 8, 18, 15, 18, 12, 14, 12, 8, 8, 8, 8, 9, 9, 9, 12, 7, 10, 10, 8, 8, 12, 12, 12, 7, 12, 12, 9, 7, 7, 7, 7, 7, 8, 15, 12, 9, 10, 10, 7, 10, 10, 13, 11, 10, 9, 22, 11, 9, 8, 8, 8, 8, 8, 13, 18, 13, 9, 15, 19, 9, 7, 7, 10, 7, 7, 7, 11, 8, 13, 17, 7, 7, 10, 10, 10, 7, 20, 16, 7, 7, 7, 7, 7, 7, 11, 21, 12, 12, 13, 11, 14, 16, 8, 8, 13, 11, 7, 7, 13, 7, 7, 14, 15, 15, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 13, 10, 18, 6, 6, 6, 6, 6, 6, 6, 6, 6, 11, 8, 8, 12, 12, 11, 11, 8, 12, 9, 9, 9, 13, 13, 9, 9, 9, 9, 9, 9, 6, 10, 12, 6, 6, 6, 6, 17, 11, 7, 7, 7, 7, 14, 14, 12, 6, 7, 7, 6, 6, 15, 10, 13, 10, 6, 8, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 13, 9, 9, 15, 13, 6, 12, 12, 6, 19, 11, 10, 7, 7, 16, 8, 19, 17, 9, 9, 9, 9, 9, 6, 6, 6, 10, 8, 16, 8, 6, 6, 9, 6, 6, 6, 6, 6, 6, 6, 6, 8, 8, 8, 6, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 14, 6, 6, 6, 6, 20, 6, 9, 6, 14, 9, 9, 9, 6, 9, 8, 8, 12, 9, 8, 8, 8, 8, 7, 8, 12, 7, 8, 8, 8, 6, 8, 6, 6, 6, 6, 6, 6, 6, 9, 8, 8, 6, 6, 13, 9, 12, 13, 12, 14, 13, 12, 11, 11, 6, 8, 8, 8, 6, 13, 12, 11, 11, 12, 6, 11, 12, 11, 13, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 15, 6, 6, 6, 6, 6, 6, 6, 13, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8, 8, 8, 8, 6, 18, 6, 12, 13, 13, 13, 9, 10, 15, 9, 12, 6, 6, 6, 6, 6, 6, 6, 6, 9, 15, 10, 9, 10, 13, 9, 19, 8, 18, 17, 10, 10, 8, 8, 6, 6, 6, 6, 6, 6, 10, 14, 8, 16, 16, 9, 8, 15, 8, 8, 10, 12, 14, 7, 7, 8, 8, 7, 7, 7, 7, 8, 13, 13, 11, 9, 9, 9, 12, 10, 17, 8, 11, 9, 7, 7, 14, 8, 14, 14, 7, 7, 7, 7, 7, 7, 14, 7, 7, 7, 7, 7, 10, 10, 8, 14, 7, 7, 7, 7, 8, 8, 8, 8, 8, 17, 9, 7, 15, 7, 8, 12, 7, 9, 14, 7, 7, 7, 9, 13, 8, 14, 7, 16, 18, 13, 15, 14, 12, 13, 10, 15, 9, 7, 7, 7, 10, 13, 15, 15, 9, 9, 9, 9, 19, 11, 7, 11, 11, 13, 8, 8, 8, 8, 7, 12, 19, 17, 9, 9, 13, 7, 7, 7, 9, 7, 7, 7, 12, 13, 15, 10, 8, 8, 14, 15, 12, 13, 13, 8, 12, 14, 7, 11, 7, 14, 15, 13, 12, 8, 8, 8, 8, 11, 13, 15, 15, 8, 13, 12, 8, 8, 8, 13, 10, 16, 14, 11, 8, 8, 12, 12, 9, 15, 15, 12, 12, 13, 8, 8, 9, 12, 13, 9, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 11, 12, 11, 7, 14, 7, 13, 13, 13, 12, 18, 16, 7, 12, 11, 10, 10, 15, 9, 9, 9, 21, 7, 7, 7, 11, 16, 8, 8, 11, 11, 7, 7, 7, 7, 7, 19, 7, 7, 7, 7, 7, 7, 7, 7, 7, 12, 8, 9, 12, 14, 11, 9, 9, 9, 22, 12, 3, 3, 4, 8, 8, 15, 4, 2, 2, 5, 5, 3, 3, 3, 3, 3, 3, 6, 6, 4, 4, 4, 12, 7, 10, 2, 3, 3, 3, 3, 3, 3, 3, 6, 7, 3, 7, 5, 14, 4, 4, 7, 8, 10, 4, 1, 3, 3, 6, 2, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 4, 2, 2, 5, 3, 4, 2, 2, 2, 2, 2, 2, 11, 5, 5, 5, 11, 5, 5, 3, 5, 5, 5, 5, 11, 14, 13, 9, 11, 9, 12, 8, 11, 11, 8, 11, 16, 9, 9, 7, 10, 9, 12, 8, 15, 6, 7, 6, 6, 13, 10, 8, 11, 8, 6, 6, 6, 12, 16, 6, 11, 7, 8, 9, 18, 6, 6, 9, 4, 4, 6, 13, 6, 6, 6, 6, 8, 8, 9, 16, 7, 7, 14, 7, 8, 8, 8, 7, 7, 7, 7, 7, 7, 15, 13, 7, 10, 7, 7, 10, 12, 16, 15, 7, 9, 9, 14, 11, 11, 10, 9, 10, 8, 12, 7, 8, 7, 7, 10, 12, 7, 12, 8, 7, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 3, 3, 5, 5, 5, 10, 4, 8, 7, 10, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 7, 4, 5, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 9, 8, 2, 2, 2, 8, 12, 7, 7, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 8, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 5, 7, 11, 9, 8, 8, 8, 7, 8, 9, 7, 7, 9, 7, 7, 7, 10, 7, 7, 10, 9, 10, 6, 6, 6, 6, 6, 6, 15, 7, 8, 9, 9, 8, 6, 6, 10, 9, 6, 8, 13, 9, 7, 6, 6, 6, 6, 6, 6, 12, 6, 6, 7, 6, 7, 6, 6, 6, 10, 10, 7, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 6, 14, 6, 6, 7, 7, 9, 6, 6, 6, 6, 9, 9, 8, 9, 10, 9, 8, 9, 12, 7, 7, 7, 8, 7, 10, 12, 11, 9, 10, 7, 7, 7, 9, 10, 10, 8, 12, 9, 7, 7, 9, 8, 8, 8, 10, 7, 7, 8, 9, 9, 7, 7, 7, 8, 2, 4, 6, 3, 4, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 5, 8, 6, 4, 7, 3, 3, 3, 3, 3, 3, 3, 12, 3, 3, 3, 3, 3, 3, 4, 4, 2, 3, 5, 3, 4, 7, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 6, 4, 3, 4, 2, 2, 2, 5, 3, 3, 3, 3, 3, 5, 4, 4, 4, 4, 7, 6, 8, 9, 2, 2, 2, 2, 3, 3, 3, 5, 7, 2, 3, 3, 8, 7, 7, 2, 2, 8, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 8, 8, 7, 7, 6, 10, 6, 9, 7, 11, 4, 6, 8, 8, 7, 8, 4, 5, 5, 5, 5, 3, 3, 11, 8, 9, 6, 6, 8, 7, 4, 4, 7, 8, 7, 2, 2, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 7, 2, 2, 5, 3, 3, 2, 3, 3, 3, 3, 3, 3, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 12, 5, 5, 3, 3, 3, 5, 10, 12, 6, 15, 4, 6, 6, 7, 14, 9, 3, 3, 3, 3, 3, 8, 2, 2, 3, 5, 5, 3, 3, 3, 3, 3, 3, 8, 8, 8, 7, 5, 8, 4, 6, 11, 2, 2, 6, 7, 3, 3, 2, 9, 8, 5, 5, 3, 3, 3, 5, 5, 7, 7, 6, 6, 10, 6, 8, 6, 8, 9, 7, 4, 4, 4, 4, 7, 6, 6, 7, 7, 10, 9, 8, 11, 8, 3, 3, 3, 3, 3, 4, 4, 2, 3, 3, 3, 3, 3, 7, 6, 2, 5, 6, 7, 6, 4, 8, 9, 11, 2, 2, 3, 3, 3, 3, 3, 3, 3, 2, 2, 5, 3, 3, 3, 3, 3, 9, 9, 6, 4, 8, 7, 7, 5, 9, 8, 6, 2, 8, 7, 8, 5, 5, 5, 5, 5, 3, 3, 3, 16, 8, 7, 7, 7, 8, 7, 7, 7, 7, 9, 6, 9, 6, 10, 7, 7, 7, 6, 10, 8, 9, 11, 11, 8, 4, 4, 10, 8, 8, 6, 9, 6, 11, 8, 8, 8, 15, 7, 8, 9, 5, 3, 3, 3, 3, 3, 5, 11, 2, 2, 3, 8, 9, 10, 3, 2, 2, 2, 2, 2, 2, 3, 6, 4, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 2, 3, 3, 3, 3, 3, 3, 3, 11, 5, 3, 3, 3, 3, 3, 3, 3, 3, 6, 7, 4, 4, 2, 3, 3, 3, 3, 3, 3, 3, 3, 12, 7, 4, 12, 4, 6, 5, 4, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 11, 10, 6, 4, 6, 10, 8, 3, 3, 3, 3, 3, 3, 3, 3, 5, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 5, 3, 4, 4, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 10, 5, 5, 5, 5, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 7, 8, 8, 7, 13, 12, 10, 10, 8, 8, 7, 7, 9, 12, 11, 6, 6, 8, 8, 9, 7, 7, 7, 10, 15, 10, 4, 4, 4, 4, 4, 11, 8, 8, 9, 7, 9, 14, 14, 12, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 12, 5, 5, 5, 11, 10, 7, 9, 3, 8, 7, 3, 15, 13, 11, 4, 4, 2, 2, 2, 19, 7, 5, 5, 3, 3, 3, 3, 3, 3, 3, 5, 22, 18, 6, 14, 17, 4, 4, 19, 16, 18, 2, 3, 3, 7, 2, 3, 2, 3, 3, 6, 4, 2, 3, 3, 2, 5, 3, 3, 3, 3, 3, 3, 3, 9, 9, 2, 3, 2, 2, 2, 3, 3, 3, 5, 7, 14, 7, 7, 12, 9, 13, 6, 11, 6, 10, 9, 7, 7, 8, 12, 12, 8, 8, 8, 10, 7, 7, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 5, 8, 10, 7, 8, 11, 8, 12, 9, 4, 14, 7, 7, 9, 13, 2, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 1, 2, 2, 3, 3, 3, 3, 3, 3, 5, 2, 2, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 8, 4, 4, 4, 3, 2, 3, 3, 3, 3, 5, 2, 2, 2, 2, 5, 5, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 12, 9, 8, 8, 9, 8, 6, 17, 6, 6, 6, 8, 8, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 4, 4, 8, 8, 9, 9, 9, 7, 7, 7, 7, 7, 7, 7, 9, 9, 9, 7, 8, 8, 8, 10, 7, 13, 10, 8, 9, 3, 3, 5, 13, 3, 3, 3, 3, 3, 7, 7, 6, 6, 10, 13, 11, 11, 8, 8, 9, 8, 9, 9, 10, 10, 10, 11, 10, 10, 13, 13, 16, 15, 11, 12, 9, 9, 10, 9, 11, 10, 9, 9, 14, 7, 8, 3, 10, 7, 7, 3, 2, 2, 2, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 7, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 11, 6, 7, 4, 6, 2, 2, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 6, 4, 4, 2, 2, 2, 3, 3, 3, 3, 4, 4, 6, 6, 6, 6, 5, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9, 11, 6, 10, 9, 12, 7, 7, 11, 14, 9, 7, 12, 3, 3, 7, 12, 11, 12, 7, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 9, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 11, 5, 5, 5, 5, 5, 5, 5, 5, 11, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 3, 3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 10, 3, 3, 3, 11, 3, 5, 9, 11, 8, 12, 14, 9, 7, 8, 7, 7, 11, 11, 7, 7, 10, 9, 8, 10, 9, 7, 7, 7, 7, 7, 7, 8, 8, 7, 11, 8, 8, 8, 7, 7, 10, 8, 7, 13, 12, 7, 17, 10, 8, 8, 11, 7, 11, 11, 14, 7, 11, 7, 8, 6, 9, 20, 8, 7, 9, 16, 7, 10, 6, 11, 10, 8, 9, 7, 16, 11, 11, 9, 8, 9, 8, 8, 8, 11, 8, 15, 8, 8, 9, 7, 8, 8, 11, 10, 7, 5, 7, 10, 10, 15, 7, 7, 7, 8, 7, 8, 8, 10, 11, 10, 10, 10, 11, 11, 7, 8, 6, 8, 8, 8, 10, 6, 8, 6, 6, 7, 8, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 16, 6, 15, 6, 7, 11, 11, 7, 9, 10, 11, 13, 10, 6, 16, 8, 10, 12, 11, 6, 6, 6, 6, 6, 6, 6, 10, 6, 10, 7, 7, 7, 11, 7, 11, 6, 6, 6, 6, 6, 6, 17, 7, 7, 6, 6, 12, 22, 6, 6, 6, 6, 6, 8, 6, 6, 6, 6, 7, 6, 6, 5, 6, 6, 8, 11, 6, 9, 14, 11, 9, 11, 7, 7, 8, 6, 6, 6, 8, 10, 9, 6, 6, 6, 6, 9, 7, 6, 6, 6, 6, 6, 15, 6, 4, 4, 4, 6, 4, 17, 8, 11, 6, 6, 9, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 6, 6, 6, 6, 10, 6, 10, 6, 6, 6, 6, 12, 8, 6, 6, 6, 6, 6, 6, 6, 6, 6, 9, 6, 6, 6, 6, 18, 6, 6, 6, 8, 9, 10, 7, 8, 9, 10, 11, 7, 13, 6, 8, 8, 6, 6, 14, 7, 7, 7, 7, 10, 7, 14, 9, 6, 6, 9, 15, 9, 7, 14, 6, 11, 14, 13, 7, 12, 8, 7, 7, 7, 7, 7, 12, 7, 10, 9, 16, 6, 8, 6, 5, 17, 6, 8, 10, 4, 6, 4, 10, 15, 17, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 8, 4, 4, 11, 7, 4, 4, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 19, 17, 6, 10, 11, 6, 6, 6, 6, 18, 6, 6, 11, 4, 4, 4, 5, 6, 6, 6, 9, 5, 6, 4, 6, 6, 4, 6, 6, 6, 6, 10, 6, 6, 4, 6, 6, 10, 6, 10, 6, 6, 6, 6, 11, 6, 6, 10, 6, 6, 8, 6, 6, 6, 8, 6, 11, 4, 11, 9, 10, 9, 11, 4, 8, 4, 11, 12, 7, 9, 8, 6, 7, 7, 8, 12, 12, 11, 13, 10, 11, 7, 7, 7, 9, 7, 11, 10, 7, 7, 7, 16, 11, 10, 11, 17, 9, 9, 8, 8, 7, 7, 7, 9, 7, 7, 7, 14, 7, 13, 9, 11, 10, 14, 10, 10, 12, 11, 10, 7, 10, 5, 14, 8, 8, 8, 9, 7, 8, 7, 7, 9, 8, 7, 8, 7, 7, 7, 7, 7, 7, 7, 11, 8, 10, 8, 7, 8, 14, 11, 8, 9, 9, 9, 8, 24, 10, 10, 12, 7, 7, 15, 11, 8, 8, 12, 11, 8, 9, 9, 7, 8, 9, 10, 11, 10, 11, 7, 12, 7, 7, 11, 9, 8, 14, 13, 12, 8, 11, 10, 8, 8, 7, 7, 14, 9, 10, 8, 9, 11, 7, 14, 8, 8, 13, 8, 8, 12, 7, 10, 14, 14, 11, 9, 10, 9, 9, 7, 7, 11, 11, 13, 9, 13, 5, 5, 5, 7, 9, 5, 11, 12, 14, 8, 7, 7, 11, 10, 9, 7, 8, 8, 7, 10, 11, 11, 5, 5, 7, 5, 5, 5, 7, 7, 15, 7, 7, 8, 7, 15, 12, 12, 10, 7, 8, 7, 11, 7, 7, 7, 23, 11, 8, 8, 11, 10, 7, 8, 11, 7, 19, 7, 7, 6, 9, 9, 9, 11, 3, 4, 7, 8, 6, 6, 4, 10, 8, 2, 2]);
    var edgeChild = /* @__PURE__ */ new Uint16Array([0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 12, 1, 1, 1, 1, 1, 17, 1, 1, 1, 12, 1, 12, 1, 12, 13, 1, 1, 1, 1, 12, 1, 12, 1, 1, 1, 1, 1, 14, 21, 1, 1, 1, 1, 1, 1, 1, 19, 12, 1, 1, 1, 1, 1, 1, 1, 1, 20, 1, 1, 1, 16, 18, 1, 1, 15, 1, 1, 1, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 22, 1, 1, 1, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 1, 24, 25, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 12, 12, 12, 12, 1, 32, 0, 0, 0, 1, 1, 1, 1, 35, 34, 1, 1, 1, 1, 1, 33, 1, 1, 1, 1, 37, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 38, 0, 0, 0, 0, 39, 40, 0, 0, 0, 0, 12, 1, 1, 12, 1, 1, 1, 1, 43, 44, 44, 44, 43, 44, 43, 43, 45, 44, 43, 44, 43, 43, 43, 43, 43, 43, 45, 43, 43, 43, 43, 43, 43, 44, 46, 46, 44, 43, 43, 43, 43, 43, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 49, 51, 49, 49, 49, 51, 49, 50, 49, 52, 49, 50, 50, 49, 49, 49, 50, 52, 50, 52, 49, 50, 50, 12, 54, 54, 53, 55, 50, 52, 49, 49, 47, 48, 56, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 59, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 66, 67, 12, 1, 1, 65, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 78, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 76, 79, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 77, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 12, 1, 1, 1, 1, 89, 1, 91, 1, 1, 1, 1, 1, 1, 1, 1, 94, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 97, 97, 1, 1, 12, 1, 100, 1, 1, 1, 1, 1, 1, 1, 98, 1, 99, 1, 101, 1, 1, 1, 1, 1, 102, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 110, 111, 1, 1, 1, 1, 1, 1, 113, 113, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 121, 122, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 122, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 122, 1, 1, 1, 1, 1, 1, 1, 1, 1, 126, 123, 125, 120, 1, 124, 1, 1, 114, 1, 1, 1, 1, 117, 1, 127, 1, 1, 1, 1, 1, 1, 119, 1, 108, 1, 109, 1, 12, 128, 106, 1, 112, 1, 1, 1, 1, 1, 107, 115, 1, 12, 12, 12, 118, 116, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 12, 12, 1, 1, 1, 1, 1, 12, 134, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 136, 1, 1, 1, 1, 1, 1, 1, 1, 137, 138, 12, 12, 135, 133, 44, 44, 140, 49, 49, 139, 142, 141, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 145, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 143, 0, 0, 0, 0, 1, 0, 144, 132, 1, 0, 1, 1, 12, 12, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 148, 147, 20, 1, 1, 12, 12, 1, 20, 12, 12, 1, 1, 1, 1, 1, 134, 1, 1, 152, 1, 1, 1, 1, 153, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 1, 1, 136, 1, 1, 152, 1, 1, 1, 1, 153, 1, 1, 134, 1, 1, 1, 152, 1, 1, 1, 1, 153, 1, 1, 134, 1, 1, 1, 1, 1, 1, 1, 1, 134, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 160, 1, 1, 1, 152, 1, 1, 1, 1, 1, 153, 1, 1, 160, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 134, 1, 1, 1, 1, 152, 1, 1, 1, 1, 153, 1, 1, 1, 134, 1, 1, 152, 1, 1, 1, 1, 164, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 1, 167, 1, 1, 160, 1, 1, 1, 1, 1, 152, 1, 1, 1, 1, 1, 153, 1, 1, 160, 1, 1, 1, 1, 1, 152, 1, 1, 1, 1, 1, 153, 1, 154, 158, 158, 12, 1, 12, 166, 1, 1, 1, 1, 1, 158, 158, 158, 154, 1, 1, 1, 157, 158, 161, 165, 1, 1, 1, 1, 157, 157, 1, 1, 156, 154, 154, 157, 170, 156, 170, 1, 1, 168, 1, 156, 155, 157, 1, 1, 1, 1, 157, 1, 159, 1, 1, 1, 12, 1, 162, 1, 162, 1, 1, 1, 162, 161, 163, 169, 156, 154, 1, 1, 1, 1, 1, 1, 172, 172, 172, 172, 172, 172, 172, 172, 172, 172, 172, 172, 172, 172, 172, 172, 172, 172, 172, 173, 172, 172, 173, 172, 172, 172, 172, 174, 174, 172, 172, 173, 172, 173, 172, 172, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 176, 12, 1, 12, 12, 12, 12, 1, 12, 12, 12, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 198, 1, 1, 1, 1, 12, 204, 205, 206, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 151, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 201, 1, 1, 1, 188, 1, 1, 1, 1, 212, 1, 1, 209, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 179, 195, 1, 1, 1, 191, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 186, 1, 1, 1, 1, 1, 1, 1, 196, 1, 1, 1, 1, 200, 1, 1, 1, 1, 171, 1, 1, 194, 1, 1, 1, 197, 1, 1, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 184, 1, 12, 1, 1, 12, 1, 1, 1, 1, 187, 1, 1, 1, 193, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 1, 1, 213, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 199, 1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 178, 12, 1, 1, 1, 181, 12, 1, 1, 1, 1, 1, 1, 1, 203, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 180, 1, 1, 1, 1, 1, 1, 1, 208, 1, 1, 1, 185, 1, 1, 1, 192, 1, 12, 1, 189, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 196, 1, 1, 1, 1, 183, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 175, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 190, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 210, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 1, 211, 1, 1, 12, 1, 1, 1, 1, 182, 1, 1, 1, 190, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 1, 1, 1, 202, 1, 1, 1, 1, 177, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 207, 1, 1, 12, 1, 1, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 223, 0, 0, 0, 0, 0, 224, 0, 0, 0, 0, 0, 0, 1, 12, 1, 1, 1, 228, 1, 1, 1, 0, 229, 226, 227, 1, 1, 1, 1, 1, 1, 234, 1, 236, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 232, 1, 1, 1, 1, 1, 238, 1, 1, 12, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 237, 1, 1, 1, 12, 1, 1, 1, 1, 233, 1, 1, 1, 231, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 235, 1, 1, 1, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 1, 12, 1, 1, 1, 12, 1, 1, 244, 13, 1, 1, 1, 12, 12, 241, 242, 1, 1, 1, 1, 243, 1, 1, 12, 1, 1, 1, 1, 1, 1, 1, 245, 1, 1, 12, 16, 1, 1, 1, 1, 1, 1, 246, 1, 1, 1, 12, 12, 1, 1, 1, 1, 1, 1, 246, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 259, 259, 1, 0, 0, 0, 0, 0, 1, 12, 0, 0, 0, 0, 0, 0, 0, 0, 172, 264, 265, 1, 12, 1, 1, 1, 1, 12, 267, 1, 1, 266, 1, 1, 269, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 273, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 12, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 12, 0, 284, 0, 0, 285, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 59, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 309, 0, 0, 0, 0, 0, 0, 0, 0, 0, 311, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 1, 327, 327, 328, 327, 0, 190, 1, 1, 13, 323, 1, 321, 0, 0, 0, 0, 0, 0, 0, 324, 1, 1, 329, 1, 209, 1, 1, 1, 1, 322, 1, 319, 1, 325, 1, 317, 1, 326, 1, 318, 1, 1, 1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 12, 320, 320, 1, 1, 1, 188, 1, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 12, 1, 1, 1, 1, 316, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 332, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 269, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 372, 372, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 364, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 340, 351, 1, 1, 339, 374, 1, 345, 1, 1, 337, 369, 1, 1, 355, 336, 341, 1, 1, 1, 348, 379, 357, 1, 1, 1, 1, 1, 1, 358, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 367, 371, 0, 0, 79, 1, 1, 0, 365, 342, 378, 343, 346, 353, 1, 368, 0, 1, 0, 79, 362, 360, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 381, 1, 1, 352, 1, 79, 1, 0, 1, 1, 1, 384, 1, 0, 0, 79, 359, 0, 1, 338, 1, 1, 1, 0, 1, 1, 361, 1, 0, 1, 1, 1, 0, 1, 386, 349, 1, 1, 0, 1, 0, 0, 377, 0, 1, 1, 1, 79, 370, 1, 1, 366, 363, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 344, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 376, 0, 79, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 380, 1, 1, 1, 0, 0, 383, 0, 0, 0, 1, 356, 1, 0, 79, 382, 1, 0, 0, 0, 0, 385, 1, 1, 0, 0, 1, 0, 1, 0, 354, 0, 350, 0, 1, 1, 1, 0, 1, 1, 0, 373, 347, 375, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 12, 1, 1, 1, 12, 401, 401, 1, 1, 12, 12, 1, 401, 1, 1, 12, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 413, 1, 1, 0, 1, 1, 1, 1, 209, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 431, 431, 1, 1, 0, 0, 317, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 444, 1, 443, 1, 1, 1, 1, 1, 1, 1, 1, 1, 448, 1, 12, 12, 1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 456, 1, 1, 1, 458, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 455, 1, 450, 1, 1, 1, 1, 437, 1, 1, 1, 1, 1, 1, 1, 1, 451, 12, 1, 1, 1, 1, 457, 1, 1, 1, 452, 446, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 317, 1, 434, 1, 1, 12, 454, 1, 1, 317, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 439, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 457, 1, 1, 1, 1, 317, 1, 453, 1, 1, 1, 447, 441, 1, 1, 1, 1, 1, 442, 1, 459, 445, 1, 1, 1, 1, 1, 440, 1, 1, 1, 1, 1, 1, 1, 1, 1, 435, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 449, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 438, 1, 1, 1, 1, 1, 436, 1, 223, 460, 1, 1, 1, 1, 1, 12, 1, 1, 1, 1, 12, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 466, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 12, 1, 67, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 470, 0, 470, 470, 470, 470, 470, 470, 470, 0, 470, 470, 470, 470, 470, 1, 470, 470, 470, 0, 470, 470, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 475, 474, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 479, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 472, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 473, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 481, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 470, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 478, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 471, 0, 0, 482, 477, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 476, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 470, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 471, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 470, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 480, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 492, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 203, 203, 1, 496, 1, 1, 1, 495, 1, 1, 1, 1, 491, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 493, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 497, 1, 1, 494, 1, 1, 1, 1, 1, 1, 1, 1, 372, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 498, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 509, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 12, 1, 511, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 12, 12, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 59, 1, 1, 12, 12, 12, 12, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 530, 1, 1, 1, 1, 1, 1, 1, 531, 1, 1, 1, 1, 1, 1, 1, 529, 1, 1, 12, 1, 1, 533, 242, 1, 1, 12, 12, 1, 1, 12, 1, 12, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 537, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 543, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 132, 1, 12, 548, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 107, 1, 1, 12, 1, 1, 1, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 553, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 144, 1, 1, 1, 231, 1, 1, 12, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 578, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 223, 1, 328, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 583, 1, 1, 1, 1, 0, 585, 0, 79, 0, 584, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 12, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 592, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 587, 587, 0, 591, 589, 587, 587, 587, 587, 587, 593, 587, 587, 597, 587, 587, 587, 587, 587, 587, 587, 587, 587, 587, 594, 591, 587, 587, 591, 587, 587, 587, 587, 587, 587, 587, 587, 587, 587, 587, 587, 587, 589, 587, 587, 587, 587, 587, 595, 587, 587, 587, 587, 587, 587, 0, 0, 0, 1, 596, 1, 1, 1, 1, 590, 1, 1, 1, 1, 1, 588, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 12, 601, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 12, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 12, 1, 1, 12, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 64, 281, 307, 412, 539, 0, 4, 68, 239, 257, 283, 308, 334, 388, 414, 0, 503, 523, 540, 603, 9, 0, 60, 88, 398, 410, 430, 581, 0, 501, 522, 536, 618, 0, 30, 6, 0, 465, 504, 608, 566, 70, 0, 7, 286, 258, 389, 467, 417, 542, 79, 604, 0, 582, 310, 419, 469, 9, 105, 289, 510, 6, 30, 0, 312, 79, 391, 79, 487, 10, 6, 131, 251, 276, 0, 619, 513, 0, 569, 0, 63, 6, 6, 254, 95, 2, 433, 399, 411, 602, 0, 6, 0, 6, 287, 103, 6, 567, 505, 544, 0, 468, 390, 274, 288, 8, 71, 104, 605, 547, 392, 313, 301, 420, 146, 74, 291, 551, 514, 607, 570, 335, 330, 483, 6, 75, 149, 11, 0, 252, 526, 552, 571, 518, 556, 576, 617, 36, 6, 263, 296, 333, 305, 221, 30, 532, 559, 221, 41, 219, 268, 297, 306, 407, 424, 485, 275, 0, 73, 568, 0, 404, 418, 300, 79, 250, 79, 0, 586, 550, 508, 293, 422, 79, 393, 387, 0, 0, 0, 9, 561, 577, 220, 0, 425, 408, 535, 520, 579, 621, 85, 221, 42, 298, 396, 426, 575, 0, 515, 294, 277, 79, 218, 80, 28, 390, 30, 6, 394, 331, 304, 610, 598, 528, 555, 517, 0, 261, 81, 30, 406, 423, 0, 30, 427, 0, 222, 599, 521, 9, 409, 428, 221, 251, 86, 225, 600, 580, 563, 486, 429, 397, 253, 230, 87, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 626, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 415, 0, 0, 0, 0, 0, 0, 0, 0, 82, 0, 129, 0, 0, 84, 554, 0, 0, 0, 0, 0, 0, 0, 27, 0, 557, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 415, 0, 0, 0, 0, 507, 0, 260, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 295, 0, 0, 0, 0, 0, 0, 0, 623, 0, 0, 0, 0, 0, 622, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 395, 0, 0, 0, 488, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 69, 0, 0, 0, 0, 0, 0, 499, 0, 0, 0, 0, 0, 0, 405, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 214, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 519, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 272, 282, 0, 0, 0, 0, 0, 534, 278, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 516, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 461, 0, 0, 0, 315, 0, 0, 0, 0, 0, 0, 256, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 574, 0, 0, 0, 0, 606, 525, 0, 0, 0, 0, 247, 0, 0, 0, 0, 0, 0, 463, 0, 0, 484, 0, 0, 0, 0, 0, 61, 0, 0, 0, 270, 57, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 249, 0, 0, 0, 0, 0, 280, 616, 0, 72, 0, 0, 0, 0, 0, 0, 0, 0, 0, 625, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 0, 279, 0, 0, 0, 0, 0, 0, 573, 0, 0, 0, 0, 0, 0, 527, 0, 0, 0, 0, 0, 0, 0, 0, 0, 572, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 62, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 216, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 84, 0, 506, 0, 0, 0, 0, 0, 560, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 84, 83, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 490, 0, 489, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 262, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 462, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 290, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 541, 0, 0, 0, 0, 0, 0, 0, 0, 299, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 69, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 84, 0, 612, 0, 0, 558, 0, 0, 0, 0, 0, 0, 0, 0, 0, 248, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 615, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 524, 0, 0, 0, 84, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 502, 0, 620, 0, 0, 432, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 403, 0, 0, 0, 549, 0, 93, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 0, 0, 0, 0, 0, 0, 29, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 292, 0, 0, 0, 217, 0, 0, 0, 0, 0, 0, 564, 0, 0, 0, 0, 130, 0, 0, 0, 0, 0, 565, 0, 0, 0, 0, 0, 0, 0, 415, 421, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 400, 0, 314, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 302, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 538, 0, 0, 0, 416, 0, 0, 402, 0, 0, 0, 0, 0, 0, 609, 0, 0, 0, 545, 0, 0, 90, 0, 546, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 512, 464, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 271, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 415, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 614, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 613, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 624, 0, 0, 0, 0, 0, 562, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 303, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 611, 0, 0, 215, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 629, 629, 629, 629, 629, 629, 629, 628, 630]);
    var labelText = "orgmilcomschnetedugovdrrformsfeedbackofficialaccoorgmilschnetgovmagazinemediaunioncargopilotgroupcaarespressworksaerodromeworkinggroupair-traffic-controlaircraftaccident-preventioneducatormarketplaceambulanceinsurancecateringairportrepbodyenginesoftwaremodellingair-surveillanceconsultingchartertrainermaintenanceservicesdesignflightskydivingfreightassociationstudentgroundhandlingdgcafuelclubtaxicrewshowballooningexpresstraderbrokerauthoragentsairtrafficjournalistsafetyconsultantmicrolightaccident-investigationparachutingequipmentproductionfederationrecreationscientistnavigationengineertradingglidingleasingresearchpassenger-associationentertainmentparaglidinghangglidingaerobaticrotorcraftemergencycertificationgovernmentaeroclubexchangelogisticschampionshiphomebuiltcouncilconferencecontrolairlinecivilaviationjournalorgcomnetedugovcoorgcomnomnetobjofforgcomnetuwukiloappsframerorgmilcomnetedugovcoradioorgcomnetcommuneedogpbcoitgvorgedugov*spreviewfrontendrelayononstagingupid*mtls*privatelinktypedreamdeveloperbravemochawindsurfaivenmirenupsunwnextbegetngrokclerkwale2bwebcsbrunputerflutterflowspawnbaseshiptodaymagicpatternsnetlifyondigitaloceanrailwayhostedclaudehasurabotdashretoolvercelgithubluyanigadgetreplitcloudflaretelebitedgecomputeevervaultexponyatnoopencrpplxzeaburwasmerframerzeropsrocketpreviewconvexmedusajsspritesonherculeseasypanelstreamlitglideossnowflakemesserliloginlinehackclubcodepennorthflankbase44corespeedleapcellngrok-freeclerkstagelovableon-fleek*us-west-3ap-south-2us-central-2us-central-1eu-central-1ap-south-1us-west-2us-east-2eu-north-1ap-north-1us-west-1us-east-1*rcloudintsegorgmilcomgobbetnetintedugovturmusicasenasamutualcoopip6uriurnin-addre164homeirisgovdixdaemoncloudnssthwien*inexexkunden4accogvormymyspreadshop4lima2ixortsinfofuturecmsfuturehosting12hpprivfuturemailinglima-cityfunkfeuer123webseitednshomemelmyspreadshopcloudletswasantqldvicactnswtascatholicwasaqldvictasidwasantozqldorgcomvicasnactnetedugovnswtasconfcomairflowlambda-urltransfer-webappairflowtransfer-webapptransfer-webapptransfer-webapp-fipstransfer-webappeu-west-3ap-south-2eu-south-2eu-central-2ap-southeast-3ap-southeast-4ap-northeast-3eu-central-1mx-central-1me-central-1ca-central-1il-central-1ap-northeast-1ap-southeast-1me-south-1af-south-1eu-south-1ap-south-1ap-southeast-7us-west-2eu-west-2us-east-2eu-north-1ap-southeast-2ap-northeast-2ap-southeast-5us-gov-west-1us-gov-east-1ca-west-1us-west-1eu-west-1us-east-1ap-east-1sa-east-1privatenotebookstudiolabelingnotebookstudionotebooknotebook-fipslabelingnotebookstudionotebook-fipsnotebookstudio-fipsnotebook-fipsnotebookstudionotebook-fipsnotebookstudioeu-west-3ap-south-2eu-south-2eu-central-2ap-southeast-3ap-southeast-4ap-northeast-3eu-central-1me-central-1ca-central-1il-central-1ap-northeast-1ap-southeast-1me-south-1af-south-1eu-south-1ap-south-1us-west-2eu-west-2us-east-2eu-north-1ap-southeast-2ap-northeast-2experimentsus-gov-west-1us-gov-east-1ca-west-1us-west-1eu-west-1us-east-1ap-east-1sa-east-1onrepostsagemakercopporgmilcompronetintedugovbiznameinfoshoprsorgmilcomnetedugovbrendlyresolvenzauscotvstoreorgcomnetedugovbizinfoidacaicoittvorgmilcomschnetedugovinfocloudezproxysiteacmymyspreadshopkuleuvenwebhostingtransurl123websitecloudnsinterhostsolutionsddns5476103298edgfacbmlonihkjutwvqpsryxzbarsycoororgcomedumyftpno-iporxcloud-ipfor-somemmafanfor-morewebhopselfipjozidyndnscloudnsdscloudfor-thefor-betteractivetrailcoeconorestooteorgcomeconeteduassurmoneyafricaarchitectesrestaurantloisirstourismavocatsinfoagrounivcoorgcomnetedugoviatvdeportesaludtksatorgmilcomwebgobnetinteducienciaboliviarevistacooperativaempresanombreindustriamusicapatriamedicinademocraciapoliticapuebloindigenaplurinacionalarteblogwikiinfoagrotransportenoticiasprofesionalacademiaeconomiaecologiamovimientotecnologianaturalsimplesitecepesebamapadfmgalampbacscpirngorotomtrjspaprrprrsesmscepesebamapadfmgalampbacscpirngorotomtrjspaprrprrsesms*biaamfmtcmptvfeirasampajampanatalbelemananiradiog12medindfndbmdtrdthepoaggfjdfdefinfenflegsegongengcngorgzlgslglogppgmillelqslcimcomnomadmjabimbbibbsbabcrectecsjcetcpscpvhudieticriapipsiecnbiorioecogeoteoodoproatoartfstmatvetdetbetnetcntnotfotgrueduajuespappreptmpemparqsrvadvdevgovntrturagrjorfarjusmusdesvixxyzcozfozslzbhzmaringasantamariacampinagrandegoianiasorocabafloripasaobernardocuritibaboavistarecifeaparecidasaogoncasalvadorcuiabamorenamacapalondrinacontagemsocialfortalmaceioleilaoosascoriobranconiteroi9guacutcheblogflogvlogwikitaxicoopmanauspalmascaxiasjoinvillebaruericampinassantoandreribeiraoriopretoweorgcomnetedugovv0windsurfshiptodaycloudsitecoaccoorgnetgovofmilcomgovmediatechzacoorgcomnetedugsjgovmydnspenfnlabnbmbgcbcqconcontnuyksknsmyspreadshopno-ipawdevboxbarsyonidatemfuinabusavinstanceseceuguukussryzespawncsxcloud-ipmyphotosfantasyleaguetwmailcleverappsscrappingccwucloudnsftpaccessgame-serverccgovobjectsrmalpgcust*svcalp1aeappenginermalpgmyspreadshop4lima2ixsquare7cloudscale123websitefirenet12hpflowgotdnslinkyard-cloudcloudnslima-citydnskingobjectstorageedaccogoorusorgcomnetintedua\xE9roportxn--aroport-byaassogouvcomilgobgovcloudnses-1eu-west-1us-east-1euvipit1eurarubait1s3lbwebsites3websiteru-spbru-mskelasticcsrunstnukukcaukusnl-ams-1fr-par-1fr-par-2functionsnodess3ddlwhmrdbfnck8sifrs3-websitecockpitscblmgdbdtwhkafkpubprivs3ddlwhmrdbk8sifrs3-websitecockpitscblmgdbdtwhkafks3ddlrdbk8sifrs3-websitecockpitscblmgdbdtwhkafkk8sscalebookpl-wawfr-parnl-amsbaremetalsmartlabelinginstancesdechk2kuleuvenlaravelvoorloperurownoxazapscwhstgrvaporonline-serverobservablehqelementorantagonistreclaimjoteluluencowaydiademjelasticmatlabmagentositetrendhostingaxarnetperspectajenv-arubajelejoteravendbemergenttrafficplexconvexkeliwebserveboltbegetcdnstaticson-rancherprimetelonstackitunison-servicesdnshomelinkyardbarsyjelecloudnscocomnetgovmycn-northwest-1cn-north-1s3s3-accesspoints3-websites3s3-accesspointrdsdualstacks3-deprecatedemrappui-prods3-websiteemrstudio-prods3-object-lambdaemrnotebooks-prodexecute-apis3s3-accesspoints3s3-accesspointrdsdualstackemrappui-prods3-websiteemrstudio-prods3-object-lambdaemrnotebooks-prodexecute-apicn-northwest-1cn-north-1cn-northwest-1ebcomputeelbcn-north-1airflowcn-northwest-1cn-north-1oncn-northwest-1cn-north-1amazonawssagemakeramazonwebservicesdirectasgdsdhehahljlnmhbacscahqhshhihnlnynsnmofjbjzjxjtjhkcqtwgsjssxnxjxgxxzgz\u7DB2\u7D61\u7F51\u7EDC\u516C\u53F8orgmilcomnetedugovxn--55qx5dcanva-appsxn--io0a7iquickconnectcanvasitekhsjxn--od0algcanva-codemyqnapcloudsrvrlessclustersrealtimestorageleadpagescarrdcrdorgmilcomnomnetedugovhidnssupabaserdpareplmypiumsoxmitotaplpagesfirewalledreplitowodevwebview-assetsvfswebview-assetss3s3-accesspointdualstackemrappui-prods3-websiteaws-cloud9emrstudio-prods3-object-lambdaemrnotebooks-prodexecute-apicloud9eu-west-3ap-south-2eu-south-2eu-central-2ap-southeast-3ap-southeast-4ap-northeast-3eu-central-1me-central-1ca-central-1il-central-1ap-northeast-1ap-southeast-1me-south-1af-south-1eu-south-1ap-south-1ap-southeast-7us-west-2eu-west-2us-east-2eu-north-1ap-southeast-2ap-northeast-2ap-southeast-5ca-west-1us-west-1eu-west-1us-east-1ap-east-1sa-east-1s3s3-accesspointdualstackemrappui-prods3-websiteaws-cloud9emrstudio-prods3-object-lambdaemrnotebooks-prodexecute-apicloud9s3s3-accesspointdualstackanalytics-gatewayemrappui-prods3-websiteaws-cloud9emrstudio-prods3-object-lambdaemrnotebooks-prodexecute-apicloud9s3s3-accesspointdualstackemrappui-prods3-websiteemrstudio-prods3-object-lambdaemrnotebooks-prodexecute-apis3s3-accesspointdualstacks3-deprecateds3-websites3-object-lambdaexecute-apis3s3-accesspoints3-websites3-accesspoint-fipss3-fipss3s3-accesspointdualstackemrappui-prods3-websites3-accesspoint-fipsaws-cloud9s3-fipsemrstudio-prods3-object-lambdaemrnotebooks-prodexecute-apicloud9s3s3-accesspointdualstackemrappui-prods3-websites3-accesspoint-fipss3-fipsemrstudio-prods3-object-lambdaemrnotebooks-prodexecute-apis3s3-accesspointdualstacks3-deprecatedanalytics-gatewayemrappui-prods3-websiteaws-cloud9emrstudio-prods3-object-lambdaemrnotebooks-prodexecute-apicloud9vfss3s3-accesspointdualstackemrappui-prods3-websiteaws-cloud9emrstudio-prods3-object-lambdaemrnotebooks-prodexecute-apicloud9eu-west-3ap-south-2eu-central-2ap-southeast-3ap-southeast-4ap-northeast-3eu-central-1mx-central-1me-central-1ca-central-1il-central-1ap-northeast-1us-northeast-1ap-southeast-1me-south-1af-south-1ap-south-1ap-southeast-7us-west-2eu-west-2ap-east-2us-east-2ap-southeast-2ap-northeast-2ap-southeast-5us-gov-west-1us-gov-east-1ap-southeast-6ca-west-1us-west-1eu-west-1us-east-1ap-east-1sa-east-1mrapaccesspoints3s3-accesspointdualstacks3-deprecatedanalytics-gatewayemrappui-prods3-websites3-accesspoint-fipsaws-cloud9s3-fipsemrstudio-prods3-object-lambdaemrnotebooks-prodexecute-apicloud9s3s3-accesspointdualstacks3-deprecatedanalytics-gatewayemrappui-prods3-websites3-accesspoint-fipsaws-cloud9s3-fipsemrstudio-prods3-object-lambdaemrnotebooks-prodexecute-apicloud9s3eu-west-3ap-south-2eu-south-2computes3-ap-northeast-2elbrdss3-ap-east-1s3-sa-east-1s3-us-gov-west-1s3-eu-central-1s3-ca-central-1eu-central-2ap-southeast-3ap-southeast-4ap-northeast-3s3-website-us-west-2s3-website-eu-west-1s3-external-1eu-central-1me-central-1ca-central-1il-central-1s3-us-west-1s3-eu-west-1s3-website-sa-east-1s3-website-ap-southeast-2ap-northeast-1ap-southeast-1s3-us-west-2s3-eu-west-2me-south-1af-south-1eu-south-1ap-south-1us-west-2eu-west-2us-east-2s3-website-ap-southeast-1s3-1s3-globals3-ap-northeast-3eu-north-1airflowap-southeast-2s3-us-gov-east-1s3-fips-us-gov-east-1s3-me-south-1s3-ap-south-1ap-northeast-2s3-website-us-west-1ap-southeast-5s3-eu-north-1s3-ap-southeast-1s3-website-us-gov-west-1compute-1s3-eu-west-3us-gov-west-1s3-website-ap-northeast-1us-gov-east-1s3-fips-us-gov-west-1s3-website-us-east-1s3-ap-southeast-2ca-west-1us-west-1eu-west-1us-east-1ap-east-1sa-east-1s3-us-east-2s3-ap-northeast-1authauthauth-fipsauth-fipseu-west-3ap-south-2eu-south-2eu-central-2ap-southeast-3ap-southeast-4ap-northeast-3eu-central-1mx-central-1me-central-1ca-central-1il-central-1ap-northeast-1ap-southeast-1me-south-1af-south-1eu-south-1ap-south-1ap-southeast-7us-west-2eu-west-2ap-east-2us-east-2eu-north-1ap-southeast-2ap-northeast-2ap-southeast-5us-gov-west-1us-gov-east-1ap-southeast-6ca-west-1us-west-1eu-west-1us-east-1ap-east-1sa-east-1eu-west-3eu-south-2ap-southeast-3eu-central-1ca-central-1ap-northeast-1ap-southeast-1ap-south-1us-west-2eu-west-2us-east-2eu-north-1ap-southeast-2ap-northeast-2ap-southeast-5eu-west-1us-east-1ap-east-1sa-east-1csrframeservicesbuilderstg-builderdev-builder*ociocpocsazuregcpawsdemoinstanceeu-west-3ap-south-2eu-south-2eu-central-2ap-southeast-3ap-southeast-4ap-northeast-3eu-central-1me-central-1ca-central-1il-central-1ap-northeast-1ap-southeast-1me-south-1af-south-1eu-south-1ap-south-1ap-southeast-7us-west-2eu-west-2us-east-2eu-north-1ap-southeast-2ap-northeast-2ap-southeast-5us-gov-west-1us-gov-east-1ap-southeast-6ca-west-1us-west-1eu-west-1us-east-1ap-east-1sa-east-1previeweu-4us-4us-1eu-1us-2eu-2us-3eu-3appscomputepaasrag-cloudrag-cloud-chjcloudjcloud-ver-jpcdemonodebalancermembersipeuxvsoncillaocelotonzayalilynxsphinxfentigercustomercaracalo365cloudstaticxendevapp001testcode-builder-stgplatformmediasiteprojedrydpagesjsx0desazacncoitrueu4uhkukgrbrushatenadiarymyspreadshopfrom-flfrom-wvwebspace-hosttheworkpchatenablogcursorusercontentservesarcasmapplinzisakuratanwixsiteappchizigiizeis-into-carsdnsiskinkyadobeaemcloudis-a-therapistpgfogmyvncdojinis-an-actress1kappfldrvkozowqa2jpnmexprgmrfirewall-gatewaydynnscafjsfbsbxooguyfrom-gawoltlab-demois-a-anarchistwiardwebteaches-yogadattowebtb-hostinglive-websiteservegamegotpantheonfrom-nhsubsc-payfrom-ohvipsinaappfrom-cadyndns-officehomelinuxfrom-mahercules-appservebbsstreakusercontentfrom-okfrom-wyfastly-terrariumis-a-llamaqualyhqportalserveexchangeon-vaporvivenushopciscofreakgrayjayleaguesmetaaiusercontentfrom-iais-a-libertariansaves-the-whalestaveusercontentyolasiteoperaunitepoint2thisis-a-catererclaudeusercontentlinodeusercontentfrom-vagithubusercontentsells-for-lesshosteurcanva-appsplaystation-cloudddnsfreefrom-pafrom-prfrom-waddnskingoutsystemscloudhotelwithflightmydattois-a-nascarfanmydbserverminiserverdamnserverservehumouris-a-playerfrom-nvfrom-nmemergentagentgentappsamplifyappfrom-kyis-an-accountantnfshostserveircfrom-akpythonanywherestackhero-networkpostman-echolikescandydyndns-mailobservableusercontentserveftpfreeboxosfrom-utcdn77-storageamazonawsneat-urldyndns-serverlinodeis-a-teacherfrom-vtgleezemythic-beastsus1-pleniteu1-plenitla1-plenitpaywhirlservecounterstrikejdevcloudhealth-carereformis-into-animegoogleapisis-a-painterafricaisa-hockeynutatmetais-an-actora2hostedis-a-democratdatadetectest-le-patrondigitaloceanspacesis-a-designeris-a-hunterlinodeobjectstemp-dnsissmarterthanyoufrom-arsimplesiteevennodetownnews-stagingis-a-liberalgooglecodejelasticservemp3qualyhqpartnerdyndns-free1cooldnsest-a-la-masiondrayddnsdynuddnsfrom-orfrom-miis-a-bloggerfrom-himydobisscanvacodeis-an-engineerest-a-la-maisonupsunappdevinappswafflecellmyasustorwpenginepoweredfrom-ctservep2psame-appmyshopblocksthingdustdatalikes-piediscordsezis-with-thebandlpusercontentis-leetshopitsite3utilitiesis-a-personaltrainersinaappladeskis-a-cheflogoipselfipbase44-sandboxnospamproxyalibabacloudcsmesswithdnsauthgearappsiamallamawithgooglelutrausercontentmochausercontentframercanvasmytabitdyndns-homew-credentialless-staticblitzcpserverdiscordsaysis-a-nurseappspotatlassian-isolated-3premotewdfrom-mtwixstudiocode0emm180rmyactivedirectoryawsappsmytuleapdnsabrpolyspaceqbuserrenderbuiltwithdarkboutirgotdnsabrdnsdopaascanva-hosted-embedawsglobalacceleratorhomesecuritypcmyiphostditchyouripclever-clouddyndns-ipon-aptibleis-a-musicianhosted-by-filessecuritytacticsappspaceusercontenthomeunixstrapiappsame-previewcf-ipfsmycloudnaselasticbeanstalkis-certifieddontexistkasserverik-serverdrive-platformatlassian-3pfirebaseappherokuappawsapprunnerbarsycenteris-a-cubicle-slaveservehttpmyshopifyis-a-guruquicksytessiiitesorsitesmagicpatternsappis-a-cpameteorappfrom-wiis-a-rockstarbumbleshrimpdattolocaldatabricksappsreadthedocs-hostedfrom-rifamilydsdyndns-picsplesknsbplaceddnsaliasdynaliasdyndns-remotedoomdnsip-ddnsblogdnsis-a-doctorroutingthecloudamazoncognitobarsyonlinedsmynasddnsgurucloudflare-ipfsdeus-canvasfrom-idsmushcdnpagespeedmobilizerdyndns-at-homeunusualpersonhosted-by-previderis-a-republicandyn-o-saurstreamlitappworkisboringonthewificprapidqualifioappis-uberleetis-slickgetmyipwpdevcloudtypeformdyndns-at-workgentlentapismynascloudw-corp-staticblitzfrom-ingeekgalaxyservebeerfrom-mdonrenderspace-to-rentaivencloudappspacehostedwafaicloudcodespotblogspotatlassian-3p-us-gov-modfrom-ndfrom-msis-a-techieis-a-studentcustomer-ociis-a-photographerdurumisfrom-ksmassivegriddyndns-wikiis-an-entertaineris-a-hard-workermysecuritycamerafrom-mnrackmazedyndns-blogis-a-bulls-fanwritesthisblogfreemyipsimple-urlfrom-sdreservdauthgear-stagingest-mon-blogueuris-into-gamesrice-labsxtooldevicesakurawebis-an-anarchistoraclecloudappsdyndns-worksells-for-urhcloudfrom-dcfastvps-serverwpmucdnis-a-geekscrysecfrom-txis-into-cartoonsmodelscapetrycloudflarelocaltonetstreak-linkbalena-devicesfrom-njforgeblocksfreebox-oswebadorsitefrom-ncdoesntexisthobby-sitestreaklinkshomesecuritymacownprovidertuleap-partnersdattorelaywphostedmailservequakeis-a-socialistservehalflifepivohostingdynuhostingquipelementsw-staticblitzdyndns-webfrom-deproject-studyaliases121is-not-certifiedhercules-devis-a-financialadvisoramazonlightsailservepicsis-a-greenloseyouripfrom-ilwithyoutubemwcloudnonprodwiredbladehostingdnsdojofrom-tnpixolinomyqnapcloudis-an-artisthostedpiis-a-landscaperauiusercontentoaiusercontenton-forgeis-a-conservativedreamhostersnet-freaksapps-1and1is-goneencoreapifastly-edgefrom-nesalesforcefrom-scdeployagentoraclegovcloudappsfrom-alis-a-lawyercechirevultrobjectsstufftoreadisa-geekddnsgeeklovableprojecttry-snowplowfrom-moblogsyteis-a-bookkeepernogmyforumravendbmyboxdeelementoredsaacficogoorinforgcomgobnatneteduidstoreorgcomnetintedudevnomepublorgcomneteduathgovtestscalculatorspaynowinfoquizzesresearchedcloudnsfunnelsassessmentsjscaleforcetmacltdorgmilcompronetgovbizpresseklogesrsccloudcustomfltusrcloude4corealmgovmunicontentproxy9metacentrumdyndyndyndnsdynpagespages-researchitionoccustomercomymyspreadshopipv64diskussionsbereich4limacomrub2ixfirewall-gatewayddnssspdnsbarsykeymachinesquare7myhome-serverspeedpartnercommunity-proschuldockxenonconnectg\xFCnstigliefernbwcloud-os-instancedyndnssecmy-routerxn--gnstigliefern-wobin-butterl-o-g-i-nisteingeekin-dslin-berlinin-brbfuettertdasnetzleitungsenin-vpnlcube-serverdyn-ip24logoipdyn-berlinruhr-uni-bochum12hpgoipsrvdnsfruskygit-repossvn-reposinternet-dnsg\xFCnstigbestellenhome-webserverxn--gnstigbestellen-zvbbplacedheimdnscosidnswebspaceconfiglima-citydyndns1istmeinvirtualuserschulplattformmy-gatewayddnsseclebtimnetztest-iservmein-iservvirtual-userhome64iservschuletaifun-dnstraeumtgeradeschulserverdynamisches-dns123webseitednshomehs-heilbronndnsupdaterbssgraphicdwadpdwdaepeweaawapaafpfwfabwbpbacwcpcciwebuserapiobjects*teamst3r2lpbravepanelngrokiservstglclcrmerpflypagesbarsyvivenushoplocalcertlocalplayerbearbloggatewaydeno-stagingis-not-ais-a-goodbotdashvercelmocha-sandboxplatter-appreplitgithubpreviewworkersinbrowserevervaultis-ahrsndenoxmitmodxmyaddrstorageapipayloadgrebedocruncontainersstgstagelclstageloginlineis-a-fullstackcodepenleapcellngrok-freeis-coolstoragewebharemediatechlibp2pdiscourseimaginecomyspreadshopstoreregbiz123hjemmesidefirmcoorgcomnetedugovsldorgmilcomwebgobartnetedugovtmorgpolcomsocartnetedugovassoagrondiscoodontk12medcuegyecpaabgengorgmilgalsaltulcomadmesmgobpubdocmonfindgnriouioproartlatvetnetfotedulojgovntrturibrbarxxxofficialbasechefprofmktgpsictechinfoarqtcontdentrrpppsiqgit-pagesritmedfieorgcomlibprieduaipgovriikmeactvsportorgmilcomscieunnetedugovnameinfopintouchtawktotawkmyspreadshoporgcomnomgobedu123miwebcomputeorgcomnetedugovbiznameinfocognito-idpeusc-de-east-1onjelasticnxaspdnsbarsydirectwpdeuxfleurstransurldogadoprvwcloudnsamazonwebservicesdnshomeuserpartycokoobinmkmfidymyspreadshopalandkapsiikixn--hkkinen-5wacloudplatformh\xE4kkinen123kotisivuidacorgmilcompronetedugovbiznameinforadioorgcomneteduuserexperts-comptablestmmyspreadshopgretaprdcomnomynhccifbxoshuissier-justicenotairesaeroportfreeboxoson-webavocatassoportgouvkdnschirurgiens-dentistes-en-franceavouesfbx-os123sitewebveterinairechirurgiens-dentistespharmacienchambagrimedecinfreebox-osdediboxgoupilemszicpyicpvicppleysheezypagesedugovcnpyorgcomcybllcpvtnetedugovtnxonlineschooldaemond6atcopanelorgnetplybotdashstackitkaasorgmilcomnetedugovbizmodltdorgcomedugovcoorgcomneteduappwriteacorgcomnetedugovcloudtranslateusercontentorgcomnetedumobiassoorgcomnetedugovbarsysimplesitediscourseindorgmilcomgobneteduorgcomwebnetedugovguaminfonxhra\u6559\u80B2\u654E\u80B2\u7DB2\u7D61\u7F51\u7D61\u7EC4\u7E54\u7D44\u7E54\u7F51\u7EDC\u7DB2\u7EDC\u7EC4\u7EC7\u7D44\u7EC7\u516C\u53F8\u653F\u5E9C\u500B\u4EBA\u4E2A\u4EBA\u7B87\u4EBAltdorgcomincneteduidvgovxn--uc0ay4axn--55qx5dxn--mk0axixn--io0a7ixn--uc0atvxn--zf0avxxn--lcvr32dxn--od0algxn--wcvs22dxn--gmqw5axn--od0aq3bxn--mxtq1mxn--ciqpnxn--tn0agxn--gmq050iorgmilcomgobneteduiservwp2tempurlmircloudfreesitewpmudevmyfastgadgetcloudaccessjelehalfboltfastvpsemergenteasypanelopencraftizcombrendlynamefromrtpersoadultmedorgpolrelcomproartnetedufirminfoassoshopcoopgouvtmcomediahotelforumvideosportorgsexagrargameslakaseroticaerotikatozsdereklamcasino2000filmsuliinfoboltshopprivnewsszexcityutazasjogaszkonyveloingatlaneacaicogoormy\u1B29\u1B2E\u1B36milwebschnetkopbizzonedesaponpesxn--9tfkymyspreadshopgovmytabittabitorderravpageaccok12idforgnetgovmuniltdplcaccotttvorgcomnetmeca6g5gpgamubacaicniocoukuptverdruscsdelhiindorgmilcomwebnicfingenpronetintedugovresbizbiharbarsyinternetbusinessschooltravelsupabasealumnigujaratfirminfoaeropostbankcoopindevscloudnsno-ipbarsybarrell-of-knowledgebarrel-of-knowledgensupdategroks-thisdnsupdatefor-ourknowsitalldvrcammittwalddynamic-dnsv-infowebhopselfipdyndnshere-for-moreilovecollegemayfirstforumzcloudnsmittwaldservertypo3servergroks-theeusekd1cdndyndnsidrawsainaueuapjpusstagemocksysdevicesclientcustreservdcustdevdisrecprodtestingcobeebyteutwenteboxfusebravepstmndedynngrokorgmilcomnomnetedugovqcxqzzbarsythingdustmo-siemensrb-hostingfh-muenstergitbookbluebitecloudbeesusercontentnodeartkiloappsforgerockdarklangresinstagingapigeebubbleb-datascryptedhypernodedappnodepantheonsitegitlabgithubkeeneticvirtualservercleverappshostyhostingon-rioedugitticketstelebitwixstudioon-k3sicp0icp12038jeleqotolairbubbleappsmyaddrstolosmyrdbxwebflowdrive-platformbeagleboardhasura-applolipopdefinimavaporcloudmusicianwebflowtestazurecontainerresindevicereadthedocsloginlineeditorxmoonscalesandcatsbasicserverwebthingsbrowsersafetymarkbeebyteappbitbucketidaccovistablogorgschnetgovxn--mgba3a4f16axn--mgba3a4fraarvanedge\u0627\u064A\u0631\u0627\u0646\u0627\u06CC\u0631\u0627\u0646jclaspeziapdudcefegelemeperetevebacanatavaparasabgagfgogrgpgalclblimfmrmcbmbvbfclcmcvcrcpcchlimifibicivipirisimncnbnanenrnpntnnolomobocoaogorosopotoptvtatctbtmtltotpusulunutpspapaqsvpvvvtvavvrtrsrprgrfrcrbrarorkrvstsssbscsmsispzczbzbozen-suedtirolmyspreadshopxn--bulsan-sdtirol-nsbxn--valledaoste-ebbtrentinoaltoadigetrentin-sued-tirolxn--forlcesena-c8axn--forl-cesena-fcbxn--bozen-sdtirol-2obtriestetrentinsuedtiroltrentino-s-tirollecceudineaostesienaparmaluccapaviagenoapaduaaostamonzaabruzzoternirietiturinmilanbozenlaziofermoleccocuneonuoropratola-speziavdataaligfvgpugmolcalcamlomumbsicpmnvenvaoedugovabrsarmaremrbastoslazibxosfirenzetrentinos\xFCdtirolval-d-aostavalle-aostamessinacremonaravennatoscanatrentin-suedtirolbolognacalabriaurbinopesarofriuli-v-giuliaogliastraxn--valle-aoste-ebblaquilaandriatranibarlettasyncloudxn--valle-d-aoste-ehbaostavalleyvalled-aostatrentino-alto-adigevallee-d-aostexn--balsan-sdtirol-nsbpistoiasicilialucaniacataniaiserniaperugiabresciaveneziagorizialiguriaimperiabulsan-suedtirolbalsan-suedtirolbarlettatraniandriaxn--trentino-sdtirol-szbforl\xEC-cesenatuscanyvall\xE9e-d-aostemantovavall\xE9e-aostecasertapiemontevalleaostaval-daostafriulivgiuliatrevisoforli-cesenavall\xE9edaosteferrarapescaravald-aostatrentino-altoadigefriuli-vegiuliavallee-aostecarboniaiglesiastarantomediocampidanovalleedaostetrentinosud-tirolcampobassotrentins\xFCd-tiroltrentinos\xFCd-tirolmonzabrianzatrentino-s\xFCdtirolxn--trentino-sd-tirol-c3bpotenzacosenzavicenzaemiliaromagnavenicefrosinonemarchepordenonetrentinosued-tirolvaresemolisevall\xE9eaostefriuli-veneziagiuliabasilicatalatinaanconasavonaveronamodenabiellabolzano-altoadigepugliafoggiaumbriatrentino-stirolgenovapadovamateranovararagusapiacenzatrentinostirolvalleeaostetempio-olbiasudsardegnatrentinsudtirolmassa-carrarafriuliveneziagiuliatrentinosuedtirolandria-barletta-tranitrapanixn--cesenaforl-i8amaceratacaltanissettaascoli-picenobrindisicarraramassacagliaririmininapolivibo-valentiachietibulsan-sudtirolbalsan-sudtiroltrentino-a-adigebulsanbalsaniglesiascarboniamilanotorinoteramodell-ogliastraarezzotrentinoalto-adigerovigotrentovenetoiglesias-carboniatrentino-sud-tirolaltoadigereggio-emiliareggio-calabriasardegnatranibarlettaandriapiedmontxn--sdtirol-n2amedio-campidanotrentino-s\xFCd-tirolfriuli-vgiuliafriuli-ve-giuliaromeennaromapisa32-b16-b64-blodiastibarineencomonaplesforlicesenailiadboxosalessandriasicilytrani-barletta-andriaxn--trentin-sdtirol-7vbpesarourbinotrentinsued-tirolcesena-forliforl\xECcesenaemilia-romagnamonzaebrianzaxn--trentinsdtirol-nsbtrentinos-tiroltrentins\xFCdtirolvalledaostaolbia-tempiocampidanomediovibovalentiasassarivalle-daostalombardysud-sardegnafriulivegiuliareggioemiliamonzaedellabrianzaalto-adigevercellitrentin-sudtiroltraniandriabarlettatrentino-sudtirolascolipicenobozen-s\xFCdtirolfriulive-giuliaflorencexn--cesena-forl-mcbcarbonia-iglesiasaosta-valleycarrara-massadellogliastratrentinoa-adigexn--valleaoste-e7apesaro-urbinoxn--trentinosdtirol-7vbxn--trentin-sd-tirol-rzbxn--trentinsd-tirol-6vbtrani-andria-barlettatrentin-s\xFCd-tirolxn--trentinosd-tirol-rzbgrossetomonza-e-della-brianzas\xFCdtirolreggiocalabriatrentinoaadigetrentin-s\xFCdtirolverbano-cusio-ossolafriuliv-giuliaverbaniacampaniatrentino-aadigefriulivenezia-giuliasardiniaandriabarlettatranibarletta-trani-andriacatanzarooristanourbino-pesarocesena-forl\xECvalle-d-aostacampidano-medio123homepagesiracusatempioolbiasuedtirollombardiaavellinocesenaforl\xECtrentinofriuli-venezia-giuliabozen-sudtirolandria-trani-barlettabulsan-s\xFCdtirolbalsan-s\xFCdtirolmonza-brianzabolzanotrentino-sued-tirolbellunosalernolivornocrotonesondriodnshometrentinsud-tirolmassacarraratrentin-sud-tiroltrentino-suedtirolviterbobergamocesenaforliolbiatempiopalermobeneventoagrigentoofcoorgnetfmaitvphdengorgmilcomschnetedugovperagrikanieasukehandachitatokaiaisaikonanoharuamaobuhigashiuraowariasahiinuyamatobishimaiwakurashitarainazawatoyonegamagorimihamatoyotataharakariyayatomioguchikomakimiyoshinishiotokonamekiyosuchiryutoyohashiokazakiisshikikasugaikotakiratoeianjotogofusosetohazutsushimashinshirotakahamanisshinshikatsuhekinantoyokawaichinomiyatoyoakeodateogataakitaikawakyowahonjoogayurihonjonoshirokamiokakatagamimitanegojomeyokotekosakadaisenkazunonikahohonjyomoriyoshimisatohappoukamikoanihachirogatahigashinarusesembokufujisatokitaakitaitayanagiowanitakkomutsutsurutahirosakigonoheoirasetowadamisawanohejiaomorishingohiranairokunohehashikamitsugarushichinohehachinohenakadomarisannohekuroishisakaeisumiasahiotakiinzaiabikomatsudoyachiyomutsuzawakujukuriomigawakashiwatoganemihamanaritasakuranagaramobarahanamigawachoshishiroichoseikozakishisuikatorimidorichonankyonanfuttsuonjukufunabashinagareyamanodasosatakochuotohnoshourayasukimitsuyokaichibayotsukaidosodegauratateyamakamagayayokoshibahikariyachimatakatsuuratomisatokisarazukamogawaichikawanarashinoichinomiyashimofusaminamibososhirakoichiharaoamishirasatoikatahonaiainansaijoseiyoiyoozuuwajimaniihamanamikatamasakiuchikokihokutobetoonshikokuchuomatsuyamaimabarikamijimakumakogenyawatahamamatsunosabaeikedaobamasakaifukuiohionotsurugamihamawakasaminamiechizeneiheijikatsuyamatakahamaechizensoedaukihaomutaokawanishiogoribuzenonojosueumiokiotochikugosasagurisaigawamizumakishinyoshitomikurumekurateyamadakasuganakamamiyamanogatatakatahakataiizukakawaratagawakasuyaashiyainatsukimunakataminamitsuikishonaikurogifukuchikeisenhigashimiyakoshinguyukuhashiokagakiyamekogaongausuikahotohochuotoyotsumiyawakadazaifuhisayamatachiaraiyanagawanakagawahirokawachikujochikushinochikuhochikuzennamieotamaokumashowateneiiwakikoorinangoononishigoshimogoomotegomishimafukushimaasakawakagamiishishirakawaiitatefutabahiratayugawahanawakitakatakawamatakunimiyabukibandaihigashihironoyamatomiharuyamatsuriaizubangedatesomaaizuwakamatsuyanaizuaizumisatonishiaizuizumizakikitashiobarataishinkaneyamakoriyamainawashirotanagurafurudonosamegawasukagawaishikawatamakawaikedaogakitaruiginanenahashimahichisonakatsugawaibigawashirakawamizunamiminokamomitakekawauesekigaharatomikasakahogikitagatayamagatatajimianpachimotosuyaotsukakamigaharahidakanisekitokigujominogodoyorogifukasamatsutakayamawanouchihigashishirakawakasaharashimonitatsumagoichiyodakannakanrashowameiwakiryuotaoratomiokafujiokaitakuranaganoharahigashiagatsumatakasakishibukawaminakamikatashinatsukiyonokawabanumataannakaoizumimidorishintoisesakiuenoyoshiokakusatsutakayamanakanojonanmokutamamuratatebayashimaebashiotakekaitadaiwahongofuchukuietajimashobaramiharahatsukaichihigashihiroshimamiyoshikumanokurenakasakaseraseranishiasaminamifukuyamashinichionomichiosakikamijimajinsekikogentakeharaotobenanaeikedatohmaozoraobiraabirakyowaeniwataikibibaisharirebunerimohiroooketootarupippunishiokoppechitosefurubirahakodateshiranukakitahiroshimakushiroobihironanporoiwamizawaniikappukunneppufukushimanakasatsunaitoyourakuromatsunaiakabirakamisunagawashibechaurakawakamifuranonakatombetsuasahikawashimokawakayabeokoppebiratoriabashirisaromaatsumanumatahidakabifukamukawamikasahorokanaitoyotomisarufutsuhigashikawaishikarikitamiyoichiesashiiwanaitomariminamifuranoakkeshifuranotoyakoyakumootoineppushikaoishiraoinemuronayorohaboroashorobihororishirifujiutashinaihokutotakasuebetsuurausuassabukikonaishimamakinaiedatetoyabieinikiesanuryuoumuteshikagarikubetsuashibetsukimobetsuaibetsutobetsusobetsuembetsushimizuchippubetsurishirihokuryuhoronobeshintokutsubetsushibetsuhonbetsumombetsutsukigatakuriyamakoshimizushiriuchikutchanmurorannoboribetsukamishihorowassamushinshinotsukembuchiwakkanaikamoenaikiyosatotakinoueshikabesunagawafukagawanakagawatakikawakamikawahigashikagurahamatonbetsumatsumaemoseushirankoshishakotanimakanemashikeotofuketomakomaisandatambaitamiawajikasaiasagoshisoonoakoyashirotoyookaminamiawajiinagawafukusakitakasagokamigorikasugaharimayokawaashiyahimejiakashitaishiaogakisannantakinosumototakarazukanishinomiyashingugoshikinishiwakiyokatakaaioimikisayoyabukawanishiamagasakisasayamashinonsenkakogawaichikawakamikawatatsunotsukubaiwamaogawaasahisakaitokaioaraiitakobandodaigosuifuinaamikasumigaurakashimaomitamayachiyoshimodatetomobetoridehitachinakainashikisakuragawakasamayawaramoriyahitachiomiyanamegatayamagatahitachikamisuushikutakahagiibarakitonekoganakasowayukimihojosomitoryugasakishimotsumafujishirotsuchiurachikuseihitachiotashirosatotamatsukuriuchiharashikahakuinanaotsubatawajimakahokukawakitatsurugikaganominotosuzuuchinadakomatsuanamizunakanotohakusannonoichikanazawaiwateshiwafudaikawaimoriokaofunatohanamakikuzumakikitakamininohekunoheyamadayahabasumitaichinosekitanohatahiraizumirikuzentakatajobojiotsuchihironomiyakoiwaizumikarumaiichinohenodakujitonooshushizukuishifujisawamizusawakamaishikanegasakimannoutazukotohiraayagawazentsujihigashikagawauchinomikanonjisanukimarugamemitoyotakamatsutadotsunaoshimatonoshoakuneamamiizumihiokiyusuikinkoisasookouyamanakatanekagoshimakanoyaisenkawanabeminamitanemakurazakitarumizunishinoomotematsumotosatsumasendaioimatsudaayaseebinamiurazushinakaiodawaraiseharasagamiharahakoneaikawakaiseiatsugitsukuihadanoyamatoyamakitazamaoisochigasakininomiyayokosukakamakuraminamiashigarafujisawasamukawakiyokawahiratsukayugawaraokawaumajikochitsunootoyoakiinonishitosayasudahidakamiharasakawaniyodogawahigashitsunokagamigeiseisusakiotsukinaharisukumomurototosakamiochitoyotosashimizumotoyamanankokunakamurakitagawayusuharaogunichoyoukiasoutoozugyokutoamakusamifunetakamoriyamagaminamataminamiogunikikuchisumotoyamatonagasumashikiaraokumamotokamiamakusanishiharayatsushiroayabeseikasakyoideineujinakagyokameokakyotangokyotanabekyotambaminamiyamashiroyamashinatanabeyawatawazukaminaminantanmiyazuhigashiyamafukuchiyamakitamukokamojoyokizumaizuruujitawaraoyamazakinagaokakyokumiyamakawagoeinabeshimameiwaasahitaikiudonoisetsukisosakikuwanamihamamiyamasuzukatamakimisuginabarikumanokomonominamiisewataraitobakiwatakikihotadomatsusakayokkaichikameyamaureshinoishinomakishichikashukuohirataiwaosakizaohigashimatsushimashikamaiwanumashibataogawaraonagawakawasakiseminemarumoriminamisanrikukakudamuratawakuyatomiyanatoriwataritagajomisatotomekamirifushiroishimatsushimayamamotoshiogamafurukawahyugaebinotsunosaitoayakushimanobeokakitauramiyazakitakazakigokaseshiibamimatashintomikunitomikitakatakobayashikawaminamitakaharukijotakanabemiyakonojonishimeranichinankitagawakadogawamorotsukakisofukushimaminamimakisakaeobuseikedaogawamiasaokayaasahiotakiotarichinoinaomichikumakomaganechikuhokukaruizawayasuokaooshikaikusakaminamiaikitogakushimatsukawakawakamitateshinatakamorikitaaikishiojirimiyadahakubaiizunaiijimaiiyamamiyotasuzakayasakatoguraookuwanagawaminowahirayayamagataminamiminowafujimiomachisakakitakaginaganonakanosakuhokomoronagisoshinanomachiwadauedaiidaharasuwatomiachiaokianankisosakunozawaonsenagematsutakayamashimosuwamatsumotoyamanouchinakagawamochizukiazuminotatsunoobamaomuraseihiunzenosetofutsuikichijiwanagasakiisahayahasamisaikaikawatanasasebohiradokuchinotsugototogitsutsushimashimabarashinkamigotomatsuurayamazoekashibaikomakawaitenrioyodosangokoryoudaojiikarugayamatokoriyamatenkawakatsuragikurotakikawakamimiyakemitsuetakatorikamikitayamayamatotakadahegurishinjokanmakisakuraitawaramotogoseoudanarasoniandokawanishishimoichihigashiyoshinokashiharashimokitayamanosegawayoshinomintsivorytopazsakuragehirnsumomoaseinetopalmail-boxmokurenyoitamuikaojiyagosensanjoaganomyokoseiroagaomishibataniigatanagaokamurakamiuonumayuzawakariwatagamitainaitsunanminamiuonumatochioyahikojoetsuseiroukamosadoizumozakitokamachiitoigawasekikawakashiwazakitsubamemitsukekokonoesaikiusukibeppuusahimeshimakunisakihasamataketatsukumihitaoitahijikusuyufukujukamitsuebungoonobungotakadaibaraniimibizentsuyamaokayamakasaokahayashimayakagemaniwaakaiwamisakishinjotamanotakahashikibichuowakesojanagishookumenannishiawakurakurashikiasakuchisetouchikagaminosatoshotomigusukunakagusukuyaeseizenaurumaiheyaaguniogiminanjokinminamidaitokitanakagusukuyonaguniokinawaishigakikunigamiurasoekadenataramahiraraginozataketomishimojizamamitonakiitomanhigashimotobuyonabarugushikamionnanahanagohaebarukumejimakitadaitonakijinnishiharayomitanginowantokashikiishikawaikedasuitaminohizuminishisakaikananabenodaitoosakasayamayaokishiwadatadaokakaizukatondabayashichihayaakasakakumatorikadomasayamahigashiosakashijonawatehirakatataishimisakitajirihannansennankatanotoyonominatosettsuhigashiyodogawaibarakinosekitachuohigashisumiyoshifujiiderakashiwaraizumiotsutoyonakamatsubaramoriguchiizumisanoshimamototakatsukineyagawahabikinotakaishikawachinaganoyoshinogarikamiminearitaouchiimarihizenogikashimaariakekiyamafukudomikitagatakitahataomachigenkaikanzakinishiaritakyuragisagataratosutakushiroishikaratsuhamatamakouhokukawagoeyoshidasatteogoseirumaasakaurawaogawaniizaomiyayoriiotakishikihonjooganohannohanyuinasaitamaokegawaarakawayoshikawayokozehasudasayamahidakafukayachichibuiwatsukiryokamiyoshimikamiizumifujimiwarabiranzanmiyoshiminanoyashiosakadosugitomisatohigashichichibutodasokakukiyonokazoshiraokakasukabekounosukawajimatsurugashimamiyashirokitamotohatoyamamoroyamahatogayakumagayakawaguchinagatorokamisatomatsubushinamegawatokigawakamikawafujiminohigashimatsuyamakoshigayatokorozawas3isk01isk02ryuohkoseikonanaishorittotakashimamaibarahikonetorahimenishiazaikokagamokotoyasuotsukusatsunagahamamoriyamatoyosatotakatsukinotogawaomihachimanhigashiomiakagiunnanizumogotsuamayatsukakakinokimatsuehamadamasudahikawahikimiokuizumoyasugiyakumomisatotamayuohdahigashiizumookinoshimanishinoshimatsuwanoshimaneshimadafujiedayoshidashimodagotembaiwataatamikosaiyaizuitoizumishimahaibaramakinoharaomaezakikawanehonkannamisusonohigashiizufukuroinumazukawazufujiaraishizuokahamamatsushimizuizunokunimatsuzakimorimachiminamiizunishiizukikugawakakegawafujikawafujinomiyaujiietsugaoyamayaitaohiranikkoashikagakuroisokanumasakurashioyakarasuyamamotegiichikaikaminokawatochigihagamokanogisanobatonasumibunasushiobaranishikatautsunomiyaiwafunemashikoshimotsukeohtawaratakanezawaitanokomatsushimatokushimaichibaminamiaizumiwajikikainanmiyoshinarutomimamugiananmatsushigesanagochishishikuinakagawamachidachiyodakomaefussainagitaitochofufuchuomeotahigashiyamatotoshimaokutamaaogashimakodairaedogawaarakawahachiojishinagawatachikawashibuyasuginamihinodekiyosesumidaoshimanerimamitakahamuraadachinakanomizuhobunkyomegurominatokoganeihigashikurumekokubunjihigashimurayamamusashimurayamatamakitahinochuokotokatsushikakouzushimaogasawaraakishimakunitachishinjukusetagayamusashinohachijoitabashiakirunohinoharachizunanbukotouramisasawakasayonagokogehinoyazutottorinichinansakaiminatokawaharaoyabetairainamiasahinantoimizufuchutakaokakurobeyamadajohanatoyamatonaminyuzenfunahashinakaniikawanamerikawaunazukitogahimiuozufukumitsutateyamakamiichiiwadearidayuasainamitaijikatsuragiaridagawatanabemihamahidakakainankiminomisatoshingushirahamakamitondayurakozakoyagobokitayamawakayamakudoyamahashimotokushimotokozagawahirogawakinokawanachikatsuurarsuseroeoishidasagaeoguniasahinagaitendonanyoobanazawanishikawasakataohkuratozawamikawamamurogawayamagatafunagatatakahatashonaishinjokahokuiideyuzakawanishitsuruokakaminoyamayamanobeshiratakamurayamanakayamakaneyamahigashineyonezawasakegawamitouubeyuuabushimonosekitabuseoshimatoyotaiwakunihikarishunannagatohagihofukudamatsutokuyamashowadoshitsurunanbukoshukaiminami-alpsnirasakikosugeotsukioshinohokutominobuyamanashifuefukichuokofuichikawamisatoyamanakakonakamichitabayamanishikatsuranarusawafujikawahayakawafujiyoshidafujikawaguchikouenohara\u9577\u91CE\u4EAC\u90FD\u5C90\u961C\u5927\u962A\u4E09\u91CD\u7FA4\u99AC\u5343\u8449\u6ECB\u8CC0\u4F50\u8CC0\u5948\u826Fadednelgaccogogror\u79CB\u7530\u611B\u77E5\u9AD8\u77E5\u57FC\u7389\u6C96\u7E04\u6803\u6728\u718A\u672C\u5CA9\u624B\u9752\u68EE\u5C71\u68A8\u65B0\u6F5F\u5CF6\u6839\u9CE5\u53D6\u9577\u5D0E\u9999\u5DDD\u5BAE\u57CE\u77F3\u5DDD\u5927\u5206\u5BAE\u5D0E\u8328\u57CE\u5C71\u53E3\u5175\u5EAB\u5C71\u5F62\u5FB3\u5CF6\u5E83\u5CF6\u798F\u5CF6\u798F\u5CA1\u5CA1\u5C71\u5BCC\u5C71\u9759\u5CA1\u611B\u5A9B\u798F\u4E95\u6771\u4EACxn--4it168dhatenadiaryxn--vgu402ckawaiishophatenablogcocottenamaste\u5317\u6D77\u9053penneehimeiwateversestabachibashigagonnagunmapermahaccaakitaosakauh-ohblushkochiaichifukuikuroncapooitigohyogotokyokyotopunyuthickcheap0t00g00j0mie2-ddaapyawjg0amfemsubxiiboomoobutchueekpgwrgrherskrboyrdyupperunderflierchipsmydnsheavyangryhippygirlyrulez\u795E\u5948\u5DDD\u9E7F\u5150\u5CF6\u548C\u6B4C\u5C71bambinaxn--nit225kokayamasaitamaxn--k7yn95exn--1lqs03nsapporoparasitelolipopmcxn--efvn9sniigatafukuokatokushimafukushimahiroshimakagoshimafakefurokinawaxn--8pvr4ucoolblogxn--0trq7p7nnkawasakinagasakimiyazakichilloutxn--8ltr62kxn--klty5xpeeweezombiecutegirlxn--rny31hxn--uuwu58axn--ntso0iqx3axn--djrs72d6uytoyamanikitanyantakagawamimozanagoyaboyfriendxn--2m4a15egreaterchowderegoismyamagatafashionstorexn--elqq16hxn--pssu33lsendaimiyagixn--rht27zpecoriaomorisaloonwatsonvivianxn--djty4knobushipigboatnaganopinokoxn--f6qx53asadistvelvetsecretxn--5js045dchicappayamanashiibarakidigickgirlfriendxn--1lqs71dmongolianxn--c3s14mxn--qqqt11mtochigixn--5rtq34kparallelo0o0mondkobesagabonadecaoitanarafoolkilldecimainhiholomosblokilociaoundopupugifutankcrapflopnooroopsmodsholyjeezstripperpepperbittershizuokaxn--rht3dkitakyushureadymadeicurusversusmatrixxn--rht61ehungryfloppygloomycrankyhandcraftedlittlestarxn--klt787dxn--kltx9awhitesnowsunnydaytottorilovepoptheshopbuyshopxn--5rtp49cxn--d5qv7z876cwebaccelxn--kbrq7oxn--4pvxsxn--1ctwolovesickkumamotocatfoodxn--tor131oyokohamawakayamatonkotsuxn--ehqz56nxn--uist22hxn--6btw5axn--kltp7dyamaguchifrenchkisspussycatxn--4it797kxn--uisz3gbabybluexn--zbx025dnetgamersxn--7t0a264ckanagawaxn--6orx2rishikawaxn--ntsq17ghalfmoonschoolbusjellybeanxn--mkru45iusercontentlolitapunkxn--32vp30hsakurastoragehokkaidoshimanecandypopbabymilksupersaleweblikeraindropbackdropwebsozaikikirarahateblodaynightmeneacsccogoormobiinfoaeusxxorgmilcomnetedugovorgcomnetedugovbizinfotmprdorgmilcomnomedugovassnotairespresseassocoopgouvveterinairemedecinpharmaciensorgnetedugovtraorgcomedurepgovmeneperekgacscaiiocogoitoresmshsseoulbusanulsandaeguc01milvkimmvchungnamjeonnamjeonbukeliv-dnsgyeonggijejueliv-cdnincheondaejeongangwongyeongbukgwangjuchungbukgyeongnameliv-apicoeduindorgcomembnetedugovorgmilcomnetedugovjcloudorgcomnetintedugovperbnrinfocooyorgcomnetedugovethipfscanvamypepethw3sstorachakeeneticjoinmcinbrowserdwebcyonnftstoragemyfritzaemewphlxachotelltdorgcomwebsocschngonetintedugrpgovassnomgacsccoorgnetedugovbizinfo123websiteidorgmilcomasnnetedugovconfidmedorgcomplcschnetedugovaccoorgnetgovpresstmassoirseproxaccosoundcasthoptocraftvp4c66orgnetedugovitsmcdirmyboxbarsyedgestacksynologylogintoopencloudnohostwebhopdiskstationi234tcp4hoocgroknoipprivmydsddnsdnsforlohmustransipdscloudfilegear-sgbrasiliafilegearframerbarsybarsyonlinecoprdorgmilcomnomedugovinforgcomnetedugovnameacprorgcomartnetedugovpresseinfoassoinstgouvorgnycedugovbarsydscloudjuorgcomnetedugovminisiteaccoororgcomnetgovorgmilcompronetintedugovbizmuseumnameinfoaerocoopaccoorgcomnetintedugovbizcooporgcomgobneteduorgmilcomnetedugovbiznameaccoorgmilneteduadvgovcoorgcomnetaltgovforgotherhiskeeneticispmanagernomassoprod5476132eastasiacentraluswesteuropewestus2eastus2pnortheurope-01newzealandnorth-01southindia-01southcentralus2-01norwaywest-01eastus2-01westus2-01australiaeast-01italynorth-01israelnorthwest-01swedencentral-01westeurope-01centraluseuap-01taiwannorthwest-01uaecentral-01northcentralusstage-01israelcentral-01mexicocentral-01canadacentral-01austriaeast-01germanywestcentral-01francecentral-01ukwest-01denmarkeast-01polandcentral-01eastus-01westus-01swedensouth-01eastus3-01westus3-01brazilsouth-01centralus-01francesouth-01australiacentral-01westindia-01uaenorth-01jioindiacentral-01canadaeast-01belgiumcentral-01spaincentral-01koreacentral-01chilecentral-01qatarcentral-01westcentralus-01eastus2euap-01norwayeast-01southafricanorth-01brazilsoutheast-01germanynorth-01switzerlandnorth-01switzerlandwest-01japanwest-01southafricawest-01japaneast-01eastasia-01indiasouthcentral-01taiwannorth-01centralindia-01uksouth-01southcentralus-01northcentralus-01eastasiastage-01indonesiacentral-01australiacentral2-01australiasoutheast-01malaysiawest-01koreasouth-01southeastasia-01southeastus5-01northeastus5-01jioindiawest-01rucdnwest1-usfra1-desandboxjls-sto1jls-sto3jls-sto2aglobalabglobalsslmapprodfreetlsmapvpslon-1lon-2ny-1fr-1sg-1ny-2paassnwebpaashostingjelasticnordeste-idcsocuserpagescwebfileblobservicebuscoreatlricnjsjelasticwebsitestoragesezagbinruhuukjptsmyspreadshopmynetnameakamaiorigin-stagingfrom-coipv64dynv6cdn77serveblogadobeaemcloudhicamsprytdnsupno-ipownipde5ovhicpfirewall-gatewaysytesmypsxbarsyusgovcloudapimyamazemyradwebakamaihdsaveincloudfastlylbfrom-lasubsc-paysquare7in-the-bandblackbaudcdnhomelinuxoninfernoctfcloudservebbsdns-dynamiccloudfrontakamai-stagingipifonyham-radio-opsenseeringclickrisingcommunity-profrom-nylocalcertgrafana-devedgesuite-stagingcloudflareanycasteating-organicatlassian-devmydattofeste-iplocaltotorprojectknx-serveredgekeycloudflareglobalcloudyclustercasacamserveftpakamaized-stagingakamaiorigindns-cloudmyeffectboomlabotdashbuyshousestwmailhetemlazure-mobilein-dslthruhereredirectmedynuddnsbouncemesupabaseluyanicloudappakamaicloudfunctionsdebiannhlfanpgafanstatic-accessin-vpnmysynologymafeloappudohomeftptrafficmanagersiteleafseidatmemsetcloudflarecloudaccesskeyword-onazure-apiis-a-chefdoes-itgets-itwebhopselfiphomeipkicks-assedgesuitewindowsserver-ontunnelmolemydissentscrapper-sitecloudflarecnuni5srcfggffiobbzabchrsndenodynuopikddnsvpndnsakadnselastxkinghostvps-hostfastlyhomeunixazureedgeshopselectdontexistmyfritzcloudjiffyalwaysdatasells-itsquaresbroke-itazurefddattolocalat-band-campmeinforumfamilydsazurestaticappsdefinimabplaceddnsaliasdynaliasnow-dnsblogdnsroutingthecloudendofinternetdsmynasakamaiedgemymediapcadobeio-staticakamaiedge-stagingakamaihd-stagingddns-ipprivatizehealthinsurancelive-onkrellianschokokeksmassivegridmysecuritycamerarackmazeserveminecraftfrom-azis-a-geekakamaizedmoonscaleoffice-on-theusgovtrafficmanageradobeioruntimeedgekey-stagingreserve-onlinechannelsdvrdnsdojousgovcloudappcdn77-sslapps-1and1podzoneazurewebsitesdynathomescaleforceyandexcloudvusercontentisa-geekcdn-edgescoaemalcesappwriteazimuthtlonarvobuiltwithrocketnoticeablestorecomwebrecnetperotherfirminfoartslgdloncogoiltdorgmilcolcomplcschgenngonetedugovbiznamefirmmobiacincoorgmilcomnomwebgobnetintedubizinfocomyspreadshopdemongovtransurl123websitehosting-clusterkhplaycistrongsnesosvalerv\xE5lerxn--vler-qoaossandeheroysandeher\xF8yb\xF8boheroyher\xF8yxn--hery-iraxn--b-5gavalerb\xF8boxn--b-5gasandesandexn--hery-iraxn--vler-qoav\xE5lerh\xE5re\xE5laahavaofsfvfhlolnlalrlhmfmtmahcostntbu\xE5strmreigersundmyspreadshopg\xE1ls\xE1eidsvolltingvollgildeskalflor\xF8vads\xF8vard\xF8vanylvenxn--bhccavuotna-k7astrandaxn--kvnangen-k0axn--sknland-fxaxn--mosjen-eyarakkestadhyllestadnannestadvevelstadvaapstenordre-landsondre-lands\xF8ndre-landtjieltexn--vrggt-xqads\xF8r-aurdalsor-aurdalheradstordmoldefordef\xF8rdeseljefedjeryggehemnexn--krehamn-dxasognegranes\xF8gnebrynetjomevallebykletokkegiskedovretj\xF8mehob\xF8lvoldasaudatolgas\xF8mnaviknad\xF8nnasomnadonnatranafrananesnaraumasmolatr\xE6nafr\xE6nalesjasm\xF8la\xF8rstaorstahitrafloraaukraloppafr\xF8yarissasnasahalsagalsaromsaraisar\xE1isafroyasn\xE5sagronghobolfjelltydal\xE5rdalardalaskimharamkraanghkekr\xE5anghkesorumbarumhurumb\xE6rums\xF8rummodums\xE1l\xE1tb\xE1l\xE1tfrognbjugnv\xE5ganvagangulenskienl\xF8tenlotenstrynvefsnxn--merker-kuaskaunsveiob\xF8mlobomloskj\xE5kvardoflorovadsosalatbalats\xE1latkl\xE6buklabuselbubarduulvikskjakkleppris\xF8rxn--nttery-byaefl\xE5eidflahofmilgolholsellomskifetvikdepvgsfhsaskerrisorhamarasnes\xE5snesr\xF8rosrorosxn--slat-5namasoynaroyvaroyluroydyroyaskoyradoyandoyrodoymeloyrad\xF8yand\xF8yr\xF8d\xF8ymel\xF8yask\xF8ylur\xF8ydyr\xF8ym\xE5s\xF8yv\xE6r\xF8yn\xE6r\xF8yhoylandeth\xF8ylandetdivtasvuodnal\xF8renskoglorenskognesoddtangenxn--tjme-hraxn--smla-hraxn--stjrdal-s1aunjargalillehammerunj\xE1rgaxn--hamary-fyadavvenjargaxn--bearalvhki-y4a123hjemmesidegjerdrumxn--brnnysund-m8acxn--tnsberg-q1axn--mlatvuopmi-s4axn--snsa-roaxn--skierv-utaxn--brum-voatysfjordkvafjordeidfjordkv\xE6fjordsongdalenmjondalenmj\xF8ndalenxn--gls-elackragerog\xE1\u014Bgaviikagangaviikas\xF8rreisasorreisas\xF8r-varangersor-varangerxn--risr-iraskiervaxn--frna-woaxn--trna-woakvinesdalleksvikleirvikr\xF8yrvikroyrviksvelvikvenneslaevje-og-hornnessandnessj\xF8enmarnardalvindafjordsandefjordenebakksnillfjordullensvangxn--trany-yuabr\xF8nn\xF8ysundnamsskoganaustevollxn--stjrdalshalsen-sqbnord-aurdalnord-frontr\xF8gstadtrogstadgrimstadflakstadgjerstadxn--sandy-yuaxn--leagaviika-52bnore-og-uvdalvegarsheixn--rlingen-mxaxn--ggaviika-8ya47hveg\xE5rsheikarlsoykvitsoymasfjordenhamaroyinderoyosteroydavvenj\xE1rgasauheradguovdageaidnuxn--vre-eiker-k8abronnoysiellakkr\xF8dsheradkrodsheradkvinnheradbr\xF8nn\xF8yxn--mtta-vrjjat-k7afxn--lrenskog-54akvits\xF8yv\xE1rgg\xE1tkarls\xF8yoster\xF8yinder\xF8yhamar\xF8ybronnoysundxn--aurskog-hland-jnbbahccavuotnab\xE1hccavuotnagiehtavuoatnastor-elvdalmidtre-gauldalxn--gildeskl-g0akarasjokevenassixn--bievt-0qaxn--yer-znalebesbynessebyxn--hbmer-xqamalselvm\xE5lselvxn--unjrga-rtam\xF8re-og-romsdalmore-og-romsdalhareidmeland\xF8rlandorlandstrand\xE5lg\xE5rdsolundalgardafjord\xE5fjorddielddanuorrikautokeinoxn--stre-toten-zcbskodjeaejriestangeliernebamblestokkefauskesn\xE5asesnaasekongsvingerlangevagberlevagxn--flor-jrahattfjelldalostre-toten\xF8stre-totenvestfoldxn--mely-ira\xE1laheadjualaheadjunordreisaxn--troms-zuaxn--lgrd-poacporsangerflatangerstavangerleikangerbremangersamnangergieldakarasjohkaxn--rdy-0nabfrostautsirasnoasatromsaxn--sr-aurdal-l8aflekkefjordj\xF8lsterjolsteraremarkhedmarkn\xE5\xE5mesjevuemienaamesjevuemiexn--vard-jrarollagmer\xE5kermerakerorskog\xF8rskogxn--bdddj-mrabd\xE1k\u014Boluoktaxn--osyro-wuaaknoluoktatrysilskjerv\xF8ymandaljondalbindalrindalmeldalsuldalorkdalsigdalalvdall\xE6rdalhurdalsirdalverdallerdallardaloppdal\xE5seralaseralhadselkrager\xF8divttasvuotnaoverhallasteinkjerxn--hnefoss-q1askedsmokorsettroms\xF8xn--dyry-iravestre-totenmuseumxn--sandnessjen-ogbrahkkeravjufylkesbiblb\xE1jddarbajddarxn--laheadju-7yarennes\xF8yxn--koluokta-7ya57hxn--hgebostad-g3aleirfjordstorfjordbalsfjordb\xE5tsfjordbatsfjordmuos\xE1tbiev\xE1tloab\xE1tk\xE1r\xE1\u0161johkan\xF8tter\xF8yxn--mjndalen-64anordkappl\xE1hppilahppialstahaugsiljanverranr\xF8ykenroykenhaldenlyngenbergenhortenh\xF8nefosshonefosstroandinbeiarnvarggatosoyroos\xF8yrotromsoidrettmuosatbievatruovatloabatvoagattynsetnessetxn--indery-fyask\xE1nitskanitraholtr\xE5holtxn--ystre-slidre-ujbandebusarpsborgbearduxn--karlsy-fyahordalandjorpelandj\xF8rpelanddeatnuringsakers\xF8r-odalsor-odalxn--slt-elabringerikeaudnedalnittedalnissedalhemsedalslattumsurnadalxn--blt-elabelverumstj\xF8rdalnaustdalhjartdalgj\xF8vikfyresdalhasviknarviklarvikgjovikmalvikgamviklenvikporsgrunnstjordalengerdaldrobakdr\xF8bakxn--msy-ula0hvestvagoyxn--vgan-qoaxn--ryken-vuaxn--lten-graxn--stfold-9xaxn--hpmir-xqaxn--lury-iram\xE1latvuopmimalatvuopmitysv\xE6rkirkenesbirkenesmoskenesb\xE1id\xE1rxn--fjord-lraxn--rdal-poabahcavuotnab\xE1hcavuotnaxn--frde-gralind\xE5sbearalvahkixn--hobl-irar\xE1hkker\xE1vjuxn--loabt-0qav\xE5g\xE5\xE1lt\xE1bod\xF8sundlundrader\xE5deetnetimeholeauregrueoddavagavegaranatanaarnasolasulaaltalekafusavangbergkvam\xE5mliamlibokntinnroangranosenoslobodor\xF8stroststat\xE5motamotivgupriv\xF8yeroyerliermossvossxn--nvuotna-hwalusterlunnermarkerh\xE1bmerhabmerhvalerfjalerxn--rholt-mratysvarbaidarfitjargaularh\xE1pmirhapmirmelhusfosnes\xF8ksnesoksnestysneshemnesevenesflesbergeidsbergtonsbergt\xF8nsberglindasxn--sndre-land-0cbnamsosxn--srum-gra\xF8ystre-slidreoystre-slidrevestre-slidretrondheimbalestrandxn--langevg-jxaaustrheimxn--skjk-soavagsoyaveroysandoykarmoyfinnoytranoyvestbytranbysykkylvenxn--hyanger-q1aspjelkavikandasuoloxn--fl-ziaxn--drbak-wuastathellexn--sr-varanger-ggbtelemarkxn--bhcavuotna-s4axn--porsgu-sta26f\u010D\xE1hcesuolocahcesuoloakrehamn\xE5krehamnsand\xF8ykarm\xF8yfinn\xF8ytran\xF8yv\xE5gs\xF8yaver\xF8ynamdalseidxn--lesund-huabadaddjaxn--vegrshei-c0axn--btsfjord-9zagildesk\xE5lporsanguxn--trgstad-r1an\xE1vuotnanavuotnahammerfestxn--sgne-graxn--brnny-wuacibestadharstadnarviikaeven\xE1\u0161\u0161ivestnesgjemnessandnesagdenesrennesoyxn--avery-yuaxn--tysvr-vrabearalv\xE1hkikongsbergspydebergrandabergxn--andy-iradavvesiidaxn--krdsherad-m8apors\xE1\u014Bgufredrikstadbjerkreimringeburennebuaurskog-holandnotteroyxn--vgsy-qoa0jxn--rmskog-byaskierv\xE1ivelandbyglandfrolandaurlandforsandxn--bjddar-ptamidsund\xE5lesundalesundfetsundfarsundovre-eiker\xF8vre-eikerakershusxn--moreke-juas\xF8rfold\xF8stfoldostfoldsorfoldh\xF8yangerhoyangerlevangerorkangertanangerxn--vestvgy-ixa6olillesandulsteinxn--rennesy-v1agranvinskjervoyxn--klbu-woalavagisxn--h-2faxn--ryrvik-byakafjordk\xE5fjordseljordfolkebiblxn--gjvik-wuajevnakerxn--kfjord-iuabudejjuxn--kranghke-b0axn--davvenjrga-y4axn--rland-uuaxn--ldingen-q1axn--mlselv-iuaxn--rady-iraxn--linds-prabrumunddalxn--ygarden-p1amo-i-ranaeidskogr\xF8mskogromskoghjelmelandxn--finny-yuaxn--sr-odal-q1axn--skjervy-v1aballangenkvanangenkv\xE6nangengratangenxn--hmmrfeasta-s4acvossevangensuohkanxn--rde-ulaxn--mli-tlaxn--ksnes-uuanordlandskanlandsk\xE5nlandsortlandfuoiskuxn--rros-graxn--hcesuolo-7ya35bxn--eveni-0qa01gagaivuotnag\xE1ivuotnaxn--seral-lradrammenmodalenmosjoenjan-mayentorskensteigengloppenxn--snes-poamatta-varjjatxn--sr-fron-q1aomasvuotnajessheimb\xE5d\xE5ddj\xE5xn--krager-gyaxn--kvfjord-nxaxn--asky-iraxn--snase-nraxn--bidr-5nacholt\xE5lenxn--vads-jraxn--jlster-byamosj\xF8enxn--rst-0nastavernxn--ostery-fyaxn--oppegrd-ixaxn--sknit-yqaxn--risa-5naoppeg\xE5rdskiptvetrendalenholtalenxn--mot-tlaxn--lhppi-xqaxn--holtlen-hxaxn--srreisa-q1akopervikxn--muost-0qaxn--bmlo-grahokksundkvalsundegersundxn--karmy-yuaullensakerxn--hylandet-54axn--kvitsy-fyaxn--bod-2nalangev\xE5gberlev\xE5gkristiansandxn--rsta-frahornindalstj\xF8rdalshalsenstjordalshalsensandnessjoenh\xE1mm\xE1rfeastaxn--lrdal-sras\xF8r-fronsor-fronnord-odalkristiansundm\xE1tta-v\xE1rjjatvestv\xE5g\xF8ynesoddennotoddenbuskerud\xF8ygardenoygardensalangenlavangenralingenr\xE6lingenlodingenl\xF8dingenlea\u014Bgaviikalaakesvuemieleangaviikauenorgexn--srfold-byaaskvollxn--rskog-uuaxn--nry-yla5gxn--vry-yla5ghammarfeastaxn--rhkkervju-01afxn--givuotna-8yakommunekrokstadelvanedre-eikerhagebostadh\xE6gebostadxn--berlevg-jxakviteseidxn--s-1faxn--l-1faxn--nmesjevuemie-tcbafuosskomo\xE5rekemoarekexn--lt-liacxn--jrpeland-54asvalbardoppegardholmestrandtvedestrandsogndalsokndalarendalsunndalfolldalxn--krjohka-hwab49jlyngdaletnedalnorddalsaltdalgausdalskedsmovaksdalgjesdalstordalxn--frya-hraaarbortedrangedalxn--smna-graaurskog-h\xF8landxn--vg-yiabtjeldsundhaugesundlindesnesxn--mre-og-romsdal-qqbxn--dnna-gradyntmpheremerseineshacknetenterprisecloudmineaccomaorim\u0101oriorgmilcriiwigennetschoolhealthkiwigovtgeekxn--mori-qsacloudnsparliamentcomedorgcompronetedugovmuseumwebsitekinservicebarsywebsitebuildereerobookheimdnsleapcelleero-stagetechcrscsslorigingohomecdbedeeeiemesecabgngilnlalplchfisiincnnoroptatitmtltruauhulumkdkukskjplvtrgrfrkrhrusesismycynzcznetinteduassoososcloudstgbetaaezaeuhkusjshatenadiarycdn77hoptozaptois-a-knightmyftpno-ipjpnddnssdpdnsspdnsbarsysweetpepperis-a-bruinsfanis-very-sweetservegameis-a-soxfanhomelinuxcdn77-secureservebbsmisconfusedwebredirectblogsitefreedesktopcouchpotatofriestoolforgeaccesscamis-lostreadmyblogsmall-webfedorapeopleserveftpis-a-celticsfanmywirepotagertwmailin-dslsellsyourhomeread-booksfreeddnscable-modemis-savednflfanufcfanmlbfanstuff-4-saleendoftheinternetin-vpnmy-firewallhomeftpis-localis-a-chefboldlygoingnowherewebhopselfipkicks-assroxatunkcamdvrfedoraprojectgotdnsdvrdnsdyndnspubtlspimientahomeunixdontexistfedorainfracloudwmflabsfspagesbmoattachmentsteckidsfamilydsdnsaliasdynaliasnow-dnscloudnsdoomdnsduckdnsblogdnshomednsroutingthecloudendofinternetdsmynasip-dynamicpoivronhttpbinmyfirewallis-very-evilmysecuritycamerais-a-linux-userwmcloudis-a-geektuxfamilyis-a-candidatedoesntexistis-very-badhobby-sitegame-hostaltervistais-foundis-a-patsfandnsdojohepforgepodzonedynservcollegefanis-very-goodfrom-meis-very-niceisa-geeknerdpolacmedsldingorgcomnomgobabonetedupleskaemhlxmyboxrockyprvcydeuxfleurspdnscodebergheyflowstatichostorgmilcomnomgobneteduorgcomeduiorgmilcomngonetedugovcloudns1337ngrokacorggogfamcomwebgobnetedugokgopgkpgovgosbizpasaugumicsopozpapuwmwsrprusiskwpspkppspkmpspokeoiawsawifoumsdnskokwpmuppuppsppiwwiwoowuzswkzoschrzpisdnwzmiuwwitdpssewsseumigugimoirmpinbwinbwiihupporzgwgriwupowwskrwioswuozstarostwokonsulattmpccopruszkowmyspreadshopostrodakartuzyopolegminamediaustkazgorajgoraolawailawalomzawloclradombytomjaworznotargilubinkoninzagantorunkutnokepnonakloczestsopotsanokturekplockslasksklepzarowlukowmedaidgdaorgmilrelcomnomatmgsmartneteduelkgovwawsossexbiztgorysejnytychypomorzeboleslawiechomesklepsdscloudunicloudzakopanelegnicarawa-mazbydgoszczswidnikkrasnikwloclawekbielawamragowograjeworealestatebeskidykaszubymalopolskaprzeworskswiebodzinlecznadfirmaszkolawarmiagdyniamiastakazimierz-dolnymalborkswidnicadlugolekaostrolekapodlasieelblagtravelsimplesitezachpomormielecszczecinnieruchomosciwalbrzychlezajsklublinbedzinpoznanwielunmielnooleckostarachowicedkontopowiatwroclawrybniksuwalkileborkslupskgdanskostrowwlkptarnobrzegtourismwegrowkrakowglogowyou2pilanysamailwrocinfoagroautobeepshoppriviqhslapypiszlodzcfolksecommerce-shopmazurypulawyskoczowrzeszowpomorskiezgierzkaliszolkuszlowiczostrowiecsosnowiecmazowszewodzislawbialowiezazgorzeleckatowicepabianicejelenia-gorawolominkarpaczsieradznowarudaczeladzkonskowolaskierniewiceswinoujscieturystykabieszczadycieszynketrzynolsztynbialystokbabia-goraprochowicewarszawastalowa-wolapolkowicegorlicegliwiceponiatowalimanowalubartowaugustowkobierzyceopocznognieznoszczytnokolobrzegshoparenapodhalebielskoklodzkostargardatwithplayitownnamecoorgnetedugovacorgcomproestnetedugovbiznameislaprofinforechtngrokmedaaaacacpaenglawjurbarbarsykeeneticavocatacctcloudnsorgcomsecplonetedugov123paginaweborgcomnetintedugovnomepublidkinbarsygovx443cloudnsorgmilcomnetedugovcooporgmilcomschnetedugovnamecomcannetlibassoaemclantmcontstoreorgcomnomrecwwwbarsyfirminfoshopartsstackitmyddnswebspacelima-cityacincooxorgedugovbarsybrendlyhbvpsvpsspectrumlandinghostingacppmordoviamcprecbgorgmilcomspbnetintedumsknovgovbirrasmcdirmytismircloudvladimirnalchikadygeyamarinepyatigorskmyjinobashkiriaeurodirvladikavkazna4ugroznykustanaikalmykiacldmaildagestaniranbuildcloudcanvaliaravalwixdevelopmentappwritemigrationneedleverceldatabasestackitcodereplravendbonporterlovableaccoorgmilnetgovcoopmedorgcompubschnetedugovservicemecomygovorggovtvmedorgcomnetedugovinfoedgfacbmlonihkutwpsryxzbdtmacfhppmyspreadshopbrandpartiorgcomfhvpress123minsidaitcouldbeworlanbibkommunalforbundfhskiopsyskomvuxkomforbnaturbruksgymnloginlineorgcomnetedugovenscaledeuusentsurgebotdaorgmilcomnetgovnowteleporthashbangplatformlovablebarsyshopwarebasehoplixbarsyonlinemsf5gitappgitpagewawamscofigma-govcaffeinefigmacanvasoltstscwputerbarsysupportchatgptsquareomniweopensocialcpanelplaycodenotionnovecorewpsquaredpreviewjelecyonbyensrhtfastvpspieboxconvexjouwwebheyflowplatformshloginlinemadethissourcecraftclouderaorgorgcomartedugouvunivmeorgcomnetedugovsurveysstatichfheiyuxs4allprojectmyfastubervibehostapp-ionosdeployagentmecoorgcomschnetedugovbizcncostoreorgmilcomneteduembaixadaconsuladokiraranohoprincipesaotomeheliohobarsystorebaseshopwaresellfyaiabkhaziavologdamordoviapenzalenugsochinavoiexnetspbmsknovnorth-kazakhstanashgabadkareliaarmeniageorgiavladimirnalchikivanovobukharaadygeyakhakassiakalugakrasnodarjambylaktyubinsktroitskbryanskobninskkurganazerbaijanpokrovskbashkiriatselinogradvladikavkazmurmansktulatuvamangyshlaktashkentchimkentgroznykaragandatermezarkhangelskkustanaikalmykiabalashoveast-kazakhstankaracoldagestantogliattibarsyredorgcomgobedumirenknightpointaccoorgjelasticdiscoursecleverappsschacmiincogoornetonlineshopcogoorgmilcomwebnicnetintedugovbiznametestcoorgmilcomnomnetedugovorangecloudpersoindorgcomfinnatnetgovensmincomtourismintlinfox0611oyaorgmilcomnetedugovquickconnectvpnplusnettprequalifymeaddrmyaddrntdllwadlnctvavdrk12orgmilpolbeltelcomwebgennetedutskkepgovbbsbiznameinfocoorgmilcompronetedugovbiznameinfobetter-thanworse-thansakurafromdyndnson-the-webmymailerorgmilurlcomneteduidvgovmydnsgameclubebizmeneacsccogotvorhotelmilmobiinfovodteiflgplkmsmsbcckhincndnvncoztltmkckppzpdprvcvkvlvcrkrkscxuzchernovtsyrivneyaltaodesavolynrovnolutskltdinforgcomnetedugovbizvinnicazhitomirternopilpoltavakropyvnytskyizaporizhzhiasevastopolsebastopoluzhgoroduzhhorodkharkovkharkivvinnytsiakhmelnytskyizaporizhzhecrimeaodessazhytomyrnikolaevcherkassydonetskluganskluhanskkirovogradivano-frankivskchernivtsikrymkievkyivlvivsumyzakarpattiamykolaivcherkasychernigovkhersonchernihivdnipropetrovskdnepropetrovskkhmelnitskiyneacsccogoorusorgmilcomedugovmyspreadshopadimono-ipbarsybarsyonlinelayershiftnh-servretrosnubapicampaignservicelugaffinitylotteryweeklylotteryraffleentrygluglugsmeaccoindependent-inquestnimsitecopropymntltdorgplcschnetgovnhsbarsyindependent-commissionindependent-reviewpolicepublic-inquiryindependent-panelconnhospindependent-inquiryroyal-commissionoraclegovcloudappscck12libaws-govccphxcclibpvtparochchtrcck12libcceatonk12coglibtecgendstmusann-arborwashtenawcck12glghcck12sealibforksolympiabainbridge-islkeyporthoquiamyarrow-pointcentraliaport-townsendsequimport-ludlowrentonsilverdalebremertonredmondsheltonbellevueport-orchardport-angeleskingstonchehalisaberdeengig-harborseattlepoulsboidmdndsddemenegacalamaiavawapailalflnmdcncscohnhmihiviwiriinmntnmocoutvtctmtgunjokakwvnvprarorasmskstxwynykyazisadninsnngosrvis-bymircloudservernamepointtoenscaledland-4-salefreeddnsstuff-4-saleazure-apinoipdatabricksappscloudnsgolffanheliohostazurewebsitesgvorgmilcomgubneteducoorgcomnetd0egvorgmilcomnetedugovmydnsiacostoree12orgmilcomnomwebgobbibrectecnetintedugovraremprendefirminfoartseducok12orgcomnethidnsidacaiiosonlahanamhanoicamauhueorgcompronetintedugovbizbacninhtayninhhoabinhnamdinhtravinhhaiphongvinhlonghaiduongquangnamquangtrithuathienhuequangninhbacgianghaugiangquangbinhsoctrangbentrethanhphohochiminhdanangkontumhatinhkhanhhoathanhhoahealthgialailaocaiyenbaibackanngheanlonganphuyenphuthocanthodaklakdongnainameinfovinhphucdongthapkiengiangtiengiangquangngailaichaulangsonlamdongdaknonghagiangangiangcaobangbinhduongninhthuanbinhthuanbaclieuthaibinhninhbinhbinhdinhtuyenquanghungyenbaria-vungtauthainguyendienbienbinhphuocschbizputerimagine-proxyorgcomnetedugovcloud66advisormypetsdyndnsxn--8dbq2axn--4dbgdty6cxn--5dbhl8dxn--hebda8bxn--80auxn--d1atxn--c1avgxn--o1acxn--o1achxn--90azhxn--55qx5dxn--uc0atvxn--od0algxn--wcvs22dxn--gmqw5axn--mxtq1mxn--12c1fe0brxn--h3cuzk1dixn--12co0c3b4evaxn--12cfi8ixb8lxn--o3cyx2axn--m3ch0j3axn--j1adpxn--90amcxn--90a1afxn--h1ahnxn--j1ael8bxn--h1alizxn--c1avgxn--j1aefxn--80aaa0cvacxn--41acaffeineexeopentunnelbotdashtelebitorgtmaccoagricorgmilnomwebnicngonetaltedugovlawnisschoolgrondaraccoorgmilcomschnetedugovbizinfoprg1-zeropstritonstackitlimazeropsaccoorgmilgov\u044F\u0441\u043F\u0431\u043E\u0440\u0433\u043A\u043E\u043C\u043C\u0441\u043A\u0431\u0438\u0437\u043C\u0438\u0440\u0441\u0430\u043C\u0430\u0440\u0430\u043A\u0440\u044B\u043C\u0441\u043E\u0447\u0438\u0430\u043A\u043E\u0434\u043F\u0440\u043E\u0440\u0433\u043E\u0431\u0440\u0443\u043F\u0440\u05E6\u05D4\u05DC\u05DE\u05DE\u05E9\u05DC\u05D9\u05E9\u05D5\u05D1\u05D0\u05E7\u05D3\u05DE\u05D9\u05D4\u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23\u0E18\u0E38\u0E23\u0E01\u0E34\u0E08\u0E23\u0E31\u0E10\u0E1A\u0E32\u0E25\u0E28\u0E36\u0E01\u0E29\u0E32\u0E17\u0E2B\u0E32\u0E23\u0E40\u0E19\u0E47\u0E15\u6559\u80B2\u7DB2\u7D61\u7D44\u7E54\u516C\u53F8\u653F\u5E9C\u500B\u4EBA\uB2F7\uB137\uD55C\uAD6D\u6FB3\u95E8\u65B0\u95FB\u6FB3\u9580\u8054\u901A\u5BB6\u96FB\u5609\u91CC\u62DB\u8058\u901A\u8CA9\uB2F7\uCEF4\uC0BC\uC131\u30B3\u30E0\u10D2\u10D4\u0431\u0433\u0440\u0444\u0435\u044Eadcdbdgdidmdsdtdaebedeeegeiejekemenepereseveyegabacalamanauavapaqasazacfbfafgfnfpfwftfbgcgagggegkgngmgsgpgvgtgugilmlnlalclglplsltlhmimjmkmmmomambmcmdmfmgmzmpmsmtmgbbblbsbecccacnclcmcvctcscmhkhghchbhthphshlinikifigiaibicivisikninhnmncnbngnsnpnvntnjoionomobocoaofodorosotoptstttytatbtetgtithtmtltrusuvuaucueuguhulumunufjdjbjtjsjlkmkhkfkdkcktkukskpkgpmpnpkpjpgqaqmqiqsvtvcvbvmvlvrwpwtwzwbwcwawgwkwmwtrsrprgrfrercrbrarnrmrlrkrirhrwsusrssspsgsesbsaslsmsissxmxaxcxuypysylymykygybycyuztzsznzmzkzdzczbzaz\u03B5\u03BB\u03B5\u03C5\u4E16\u754C\u53F0\u7063\u8D2D\u7269\u516C\u76CA\u70B9\u770B\u81FA\u7063\u7F51\u7EDC\u66F8\u7C4D\u5728\u7EBF\u7F51\u7AD9\u624B\u673A\u673A\u6784\u5927\u62FF\u6E38\u620F\u4FE1\u606F\u53F0\u6E7E\u8C37\u6B4C\u6148\u5584\u5546\u6807\u9999\u6E2F\u4E2D\u56FD\u9910\u5385\u7F51\u5740\u4E2D\u570B\u5546\u57CE\u98DF\u54C1\u5FAE\u535A\u653F\u52A1\u79FB\u52A8\u96C6\u56E2\u516C\u53F8\u516B\u5366\u5546\u5E97\u5065\u5EB7\u7F51\u5E97\u653F\u5E9C\u65F6\u5C1A\u4F5B\u5C71\u4E2D\u4FE1\u5A31\u4E50\u5E7F\u4E1C\u4F01\u4E1Ahomedepotengineering\u0627\u0645\u0627\u0631\u0627\u062Arepublicankuokgroupversicherungchannelcitadelxn--pgbs0dhxn--b4w605ferdstatebankwebsitexn--mgb9awbf\u4E9A\u9A6C\u900A\u6DE1\u9A6C\u9521alibabaxn--ngbc5azdxn--mgbbh1axn--45br5cyltoshibabuildworldcloudtradeguideplacespacedancemoviephoneprimesmilebiblestyleappleazurestoreskypegripexn--l1accdrivelottehorsehouseleasechasereisestadahondaomegaaetnaamicaninjanokiamediadeltavodkaedekaosakapizzaslingemailgmailtirolshelltmallfinallegaltotalhotelamfamforumrehabmusicciticricohcoachwatchboschearthfaithirishmiamiarchidubaiguccipraxi\u307F\u3093\u306A\u30B9\u30C8\u30A2\u30BB\u30FC\u30EBcanonsalononionnikonepsonkoelngreensevencrownikanoradioaudioweiboglobopromogalloyahoociscorodeovideomangobingotokyovolvolottokyotophotosmartsportquesttrusthyattjetztadultcymrubaidutushuxn--kprw13dubankclickblackmerckgroupsharpcheapnowtvxn--h2brj9c\u05E7\u05D5\u05DD\u0570\u0561\u0575\u043E\u0440\u0433\u0441\u0440\u0431\u043C\u043E\u043D\u043A\u043E\u043C\u0431\u0435\u043B\u043C\u043A\u0434\u049B\u0430\u0437\u0440\u0443\u0441\u0443\u043A\u0440\u0645\u0635\u0631\u0642\u0637\u0631\u0639\u0631\u0628\u0643\u0648\u0645dadcfdmedwedredphdthdbidpidkrdmsdltdiceonewmeglemoerwecfageacbanbambaaaammakianraspacpaaxawtfbcgaegongingaigvigorgdogdhlmilrilonlaolloluoljllcalgalnflafltelsrlfrllplkimibmcamcombommomifmabbjcbscbwebcabnabtabmlbpubabcbbcnecincpncllcstcwtcpwcnyckfhbzhovhmoiskiobisbitcifyituipinvinwinxincbnbcnmanfangdnmenrenkpnmtnyunrunfununobiojioriohbogmofooboooooacoecoceongoproartistottnttbbtcateatlatvetpetbetnethktmitfitintjothotgotdotbotprueduicujnjyouinknhktdkappsapgapmapdnptopgopllpjmpzipvipripesqtrvdtvitvdevmovgovhivnrwlawsewnewbmwwownowhowdvrftrmtrsfrbarcartvscrseusawsupsubssbsadsddsldssasbmsmlsxxxboxfoxgmxtjxsextaxbuyflydiysoyjoyskypaydaygayxyzanzbizwebersenerpokerlameractortatarsolar\u0EA5\u0EB2\u0EA7\u0E04\u0E2D\u0E21\u0E44\u0E17\u0E22tourslocusnexuslexusgiftsbeatsboatspartspressglassswiss\u0915\u0949\u092E\u0928\u0947\u091Ftiresgivescodeshomesgamestunesshoescardswalesloansvegastoolsdealsautosparis\u30D5\u30A1\u30C3\u30B7\u30E7\u30F3workssucksrocksxeroxforexfedexpartylillymoneystudyrugbytoraytoday\u4E2D\u6587\u7F51xn--unup4y\u5929\u4E3B\u6559\u98DE\u5229\u6D66\u65B0\u52A0\u5761enterprises\u6211\u7231\u4F60\u5609\u91CC\u5927\u9152\u5E97christmasxn--fct429kholdingsxn--8y0a063axn--mgbx4cd0ablifestyleabogadoallstatenetbank\u0643\u0627\u062B\u0648\u0644\u064A\u0643xn--s9brj9cxn--gk3at1ebestbuycharityxn--55qx5dmicrosoftpropertybasketballhomegoodscorsicajewelrygallerygrocerysurgerycountrybrusselsverisignferreroxn--czr694bhdfcbankcommbanksoftbank\u067E\u0627\u0643\u0633\u062A\u0627\u0646\u067E\u0627\u06A9\u0633\u062A\u0627\u0646nextdirect\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0647\u0627\u0644\u0639\u0644\u064A\u0627\u0646xn--h2brj9c8cxn--80adxhksshikshaxn--mgbai9azgqp6jcuisinellabarclayscatholicxn--kpry57dcompanyxn--xhq521bblackfridayxn--mgba3a3ejtsandvikxn--d1acj3bacademydownload\u0645\u0644\u064A\u0633\u064A\u0627xn--j1amhxn--w4r85el8fhu5dnraipirangaathletaxn--fhbeixn--mgbqly7cvafrzuerichxn--c2br7g\u0B87\u0BB2\u0B99\u0BCD\u0B95\u0BC8contractorsxn--io0a7igraphicsinsurancetemasekxn--xkc2al3hye2amotorcyclesphotographydirectoryplumbingxn--vhquvclothingtrainingcleaningwilliamhilllightingxn--mgba3a4f16ashoppingcateringeducationokinawapicturesventuresproductionsxn--9et52uwalmart\u0D2D\u0D3E\u0D30\u0D24\u0D02supportrealestatecapitalonexn--nqv7fs00emaauspostfloristdentistxn--qxamgodaddybradescobargainsmitsubishikerryhotelsxn--9dbq2axn--3pxu8kimmobilienxn--fjq720axn--mgbtx2bholidaymckinseymadridbusinessbuildershelsinkixn--4gbrim\u043C\u043E\u0441\u043A\u0432\u0430\u0627\u0644\u0633\u0639\u0648\u062F\u06CC\u0629coffeedegreelacaixapartnersalsaceofficeabbvievoyageorangegeorgeonlinechromemobilekindlegoogleoraclecircleschulesecureinsurexn--mgba7c0bbn0aestatexn--mgbc0a9azcgcruisehangoutxn--vuq861bxn--42c2d9arexrothfirestoneuniversityxn--nnx388alifeinsuranceextraspace\u043E\u043D\u043B\u0430\u0439\u043Dverm\xF6gensberatersoftwarexn--fiqs8sxn--mgbab2bdxn--w4rs40ltienda\u092D\u093E\u0930\u0924\u092E\u094Dafricatoyotaotsukasakuracameracreditcardnagoyaconsultingnetworktheatermonsterprogressivepioneerxn--55qw42gracingdatingvotingvikinglivinggivingxn--bck1b9a5dre4cbrotherweatherjoburg\u0641\u0644\u0633\u0637\u064A\u0646lplfinancialxn--clchc0ea0b2g2a9gcdfutbolschoolsocialglobaldentalwoodsidechanelairtelmatteltravelrealtorwebcamstream\u0C2D\u0C3E\u0C30\u0C24\u0C4Dunicomalstomxn--nodexn--6frz82gmuseumfurniturexn--rvc1e0am3exn--mix891faccenturexn--11b4c3dismailineustardiscountquebeccomsecclinicservicesxn--y9a3aqxn--c1avgswatchchurchsearch\u0627\u0644\u0627\u0631\u062F\u0646marketingcontacthealthmonashshoujisanofitaipeiamericanexpresssuzuki\u30A2\u30DE\u30BE\u30F3\u30AF\u30E9\u30A6\u30C9\u30DD\u30A4\u30F3\u30C8bharti\u30B0\u30FC\u30B0\u30EBxn--mgberp4a5d4armemorialxn--1qqw23alondonmormoninstitutevisionbostonnortoncouponmaisonamazonvirginberlindesigndurbanolayannissananquanxihuanhitachikaufengardenreisenbayerntechnologydatsunxn--90a3aclatinocasinostudiophysioxn--ngbe9e0apharmacytattootaobaoaramcoexpertreportabbottdirectselectimamatfairwindspictettargetmarketintuittravelersinsurancecreditdupontryukyusuppliesxn--tckwebnpparibasschmidtmerckmsdyodobashirestaurantbridgestonecricketxn--fpcrj9c3dbostikbroadwayattorneylefrakemerckxn--fiq228c5hscareersfarmerswinnersflowersxn--wgbh1cguitarsxn--54b7fta0ccxn--p1acfmakeupgalluplandroverxn--kcrx77d1x4agoldpointbauhausxn--mgbayh7gpahiphopplaystationxn--mgba3a4fraxn--eckvdtc9dhyundaixn--gckr3f0fistanbulticketsmarketsflightschintaireviewsxn--3e0b707ewindowsxn--fiqz9sfinancialxn--fzys8d69uvgm\u0627\u0628\u0648\u0638\u0628\u064Adiscoverreview\u09AC\u09BE\u0982\u09B2\u09BExn--5su34j936bgsgmoscowobserverapartments\u0434\u0435\u0442\u0438\u0627\u0631\u0627\u0645\u0643\u0648\u0441\u0430\u0439\u0442eurovisionxn--i1b6b1a6a2exn--xkc2dl3a5ee0h\u062A\u0648\u0646\u0633\u0645\u0648\u0642\u0639\u0628\u0627\u0631\u062A\u0680\u0627\u0631\u062A\u0634\u0628\u0643\u0629\u0639\u0645\u0627\u0646\u0628\u064A\u062A\u0643\u0639\u0631\u0627\u0642readkredbondlandbandfundfoodprodgoldfordtubecafesafelifeggeeieeefreefagepagegugezonewinememenamegamesaleablebikenikelikecarecbreherefiresaveloveliveblueartedatesitevotecaseluxebofamodaltdaasdatiaayogasinavanashiaasiajavabbvatevavivadatazaraarpacasavisasncfprofmaifsurfgolfdvagsongbingpingwangkpmggoogblogpohlfailcooldellcalldeallidlsarlfilmteamroomfarmimdbarabclubhdfcicbchsbcgmbhrichtechfishdishcashminiernikddiaudiwikimobitaxicitikiwidesiqponskinloanakdnwienopenporncerntownimmolimoolloinfonicofidolegosaxozeroaerovivoautovotomotofastbestresthostpostnextlgbtchatseatgiftmeetdietreitmintrentgentspotscotguruitausohumenucyoubanklinkpinkdclktalksilkbookseekworkrsvpaarpjeepshopcoophelpcamppccwshowbeerstarruhrflirweirhaircarsparsjprshausplusnewstipstoysjobskidsfanspicsdocsxboxamexsexynavycitysonyarmyallybabyplaydeliverybuzzgbizlamborghiniphilips\u0DBD\u0D82\u0D9A\u0DCF\u0CAD\u0CBE\u0CB0\u0CA4fitnessexpresslanxesspfizercenterwalterlawyersoccercareerkosherbrokerlockerdealerdoctorauthorxn--mgbqly7c0a67fbcverm\xF6gensberatungjaguarxn--pssy2uxn--hxt814eflickrrepairrogersairbusxn--mgbai9a5eva00beventsyachtsxn--t60b56a\u09AD\u09BE\u09F0\u09A4\u09AD\u09BE\u09B0\u09A4\u092D\u093E\u0930\u0924\u092D\u093E\u0930\u094B\u0924viajeshermeshughesxn--j1aef\u0938\u0902\u0917\u0920\u0928villas\u0B2D\u0B3E\u0B30\u0B24claimshotels\u0AAD\u0ABE\u0AB0\u0AA4zapposphotosjuegoscondostatamotorsgratistennis\u0A2D\u0A3E\u0A30\u0A24tkmaxxtjmaxxschaeffleryandexxn--80aswgrealtysafetybeautyluxuryxn--3ds443gsupplyfamilyxn--o3cw4hhockeysydneyxn--90aenissayalipayenergycomputeragencyxn--rovu88b\u96FB\u8A0A\u76C8\u79D1xn--gecrj9cstatefarmaccountantaquarelleolayangroup\u9999\u683C\u91CC\u62C9xn--p1ai\u7EC4\u7EC7\u673A\u6784xn--1ck2e1bxn--mgbt3dhdschwarz\u0645\u0648\u0631\u064A\u062A\u0627\u0646\u064A\u0627abudhabinowruzkomatsufujitsuhospitalxn--80asehdbxn--mgbtf8flxn--j6w193gxn--yfro4i67oprudentialxn--flw351ecruisescoursesrecipesxn--e1a4cferrarixn--ses554gxn--wgbl6awatchesstaplessinglesxn--mgbcpq6gpa1axn--otu796dpropertiescreditunionxn--mgbah1a3hjkrdstockholmhisamitsu\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629stcgroupdomainsoriginscouponsbloombergclubmedfroganslimitedxn--80aqecdr1aexposedinternationalequipmentbarclaycardxn--q7ce6axn--mgbi4ecexpprotectionassociatesconstructionxn--cck2b3bxn--45q11candroidfoundation\u05D9\u05E9\u05E8\u05D0\u05DCxn--mgbca7dzdocliniqueboutiqueengineerxn--qxa6asystemsfirmdalefashionauctionxn--nqv7finfinitirentalsreliancetradingweddingfishinghostinggentingbookingcookingxn--3hcrj9cgraingerxn--czrs0tdemocratsamsungyokohamaxn--h2breg3evexn--nyqy26alundbeckmelbournevacationssolutionsfrontierxn--vermgensberatung-pwbmanagementxn--cg4bkixn--mgb2ddeslincolnhamburgsandvikcoromantblockbusterairforcebarefootxn--4dbrk0ceinvestmentsfeedbackcommunityxn--ngbrx\u0627\u0644\u0628\u062D\u0631\u064A\u0646diamondsamsterdamhealthcareredumbrellaxn--mxtq1mxn--2scrj9cagakhanxn--mgbpl2fh\u043A\u0430\u0442\u043E\u043B\u0438\u043Acaravan\u0B9A\u0BBF\u0B99\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0BC2\u0BB0\u0BCDrichardlimortgageamericanfamilyxn--fzc2c9e2cscholarshipssaarlandxn--imr513nvlaanderensamsclubgoodyearkitchen\u0B87\u0BA8\u0BCD\u0BA4\u0BBF\u0BAF\u0BBEweatherchannelallfinanzxn--kput3i\u0627\u0644\u0633\u0639\u0648\u062F\u06CC\u06C3xn--90aisxn--efvy88h\u0627\u0644\u062C\u0632\u0627\u0626\u0631xn--mgbaam7a8hexchangejpmorganxn--tiq49xqyjfidelitysecurityxn--mk1bu44cwanggouxn--fiq64bxn--6qq986b3xlxn--mgbbh1a71exn--80ao21amarshallsxn--5tzm5gtravelerspanasoniclatrobeyoutubeaccountantsxn--rhqv96gxn--cckwcxetdanalyticsxn--ygbi2ammx\u0628\u0627\u0632\u0627\u0631\u0628\u06BE\u0627\u0631\u062A\u0633\u0648\u0631\u064A\u0629organicfresenius\u0633\u0648\u0631\u064A\u0627xn--9krt00axn--qcka1pmcxn--jlq480n2rgdeloittesciencefinancexn--jvr189mxn--30rr7yhomesensehotmailbaseballfootballleclercboehringerxn--q9jyb4cxn--mix082f\u0627\u0644\u064A\u0645\u0646\u0647\u0645\u0631\u0627\u0647politie\u0633\u0648\u062F\u0627\u0646\u0627\u064A\u0631\u0627\u0646\u0627\u06CC\u0631\u0627\u0646netflixyamaxunxn--lgbbat1ad8jcollegestoragecapetowncolognekerrypropertiesxn--mgbgu82axn--ogbpf8flxn--czru2dwhoswhociprianilasallexn--g2xx48cforsalebanamexaudiblexn--vermgensberater-ctbxn--zfr164bericssonvanguardxn--45brj9cindustriestheatremarriottxn--3bst00mcomparexn--mgberp4a5d4a87gcapitaldigital\u0627\u0644\u0645\u063A\u0631\u0628barcelonashangrilaxn--d1alfcalvinkleinwwwcitysapporokawasakinagoyasendaikobekitakyushuyokohamackjp";
    var rulesRoot = 627;
    var exceptionsRoot = 631;
    var numberOfNodes = nodeFlags.length;
    var numberOfEdges = edgeLength.length;
    var edgeOffset = new Uint32Array(numberOfEdges);
    var edgeHash = new Uint32Array(numberOfEdges);
    var wildcardEdge = new Int32Array(numberOfNodes).fill(-1);
    for (let node = 0, offset = 0; node < numberOfNodes; node += 1) {
      for (let edge = edgeStart[node]; edge < edgeStart[node + 1]; edge += 1) {
        edgeOffset[edge] = offset;
        const end = offset + edgeLength[edge];
        let hash = 5381;
        for (let i = end - 1; i >= offset; i -= 1) {
          hash = hash * 33 ^ labelText.charCodeAt(i);
        }
        edgeHash[edge] = hash >>> 0;
        if (edgeLength[edge] === 1 && labelText.charCodeAt(offset) === 42) {
          wildcardEdge[node] = edge;
        }
        offset = end;
      }
    }
    var matchNode = -1;
    var matchStart = 0;
    var matchEnd = 0;
    function labelEquals(edge, hostname, start, length) {
      if (edgeLength[edge] !== length) {
        return false;
      }
      const offset = edgeOffset[edge];
      for (let i = 0; i < length; i += 1) {
        if (labelText.charCodeAt(offset + i) !== hostname.charCodeAt(start + i)) {
          return false;
        }
      }
      return true;
    }
    function findEdge(node, hash, hostname, start, length) {
      let lo = edgeStart[node];
      let hi = edgeStart[node + 1];
      while (lo < hi) {
        const mid = lo + hi >>> 1;
        const value = edgeHash[mid];
        if (value < hash) {
          lo = mid + 1;
        } else if (value > hash) {
          hi = mid;
        } else {
          for (let e = mid; e >= lo && edgeHash[e] === hash; e -= 1) {
            if (labelEquals(e, hostname, start, length))
              return e;
          }
          for (let e = mid + 1; e < hi && edgeHash[e] === hash; e += 1) {
            if (labelEquals(e, hostname, start, length))
              return e;
          }
          return -1;
        }
      }
      return -1;
    }
    function walk(hostname, root, allowedMask) {
      let node = root;
      let end = hostname.length;
      let hash = 5381;
      matchNode = -1;
      for (let i = hostname.length - 1; i >= 0; i -= 1) {
        const code = hostname.charCodeAt(i);
        if (code === 46) {
          const start = i + 1;
          let edge2 = findEdge(node, hash >>> 0, hostname, start, end - start);
          if (edge2 === -1) {
            edge2 = wildcardEdge[node];
          }
          if (edge2 === -1) {
            return matchNode !== -1;
          }
          node = edgeChild[edge2];
          if ((nodeFlags[node] & allowedMask) !== 0) {
            matchNode = node;
            matchStart = start;
            matchEnd = end;
          }
          end = i;
          hash = 5381;
        } else {
          hash = hash * 33 ^ code;
        }
      }
      let edge = findEdge(node, hash >>> 0, hostname, 0, end);
      if (edge === -1) {
        edge = wildcardEdge[node];
      }
      if (edge !== -1) {
        node = edgeChild[edge];
        if ((nodeFlags[node] & allowedMask) !== 0) {
          matchNode = node;
          matchStart = 0;
          matchEnd = end;
        }
      }
      return matchNode !== -1;
    }
    function suffixLookup(hostname, options, out) {
      if (fastPathLookup(hostname, options, out)) {
        return;
      }
      const allowedMask = (options.allowPrivateDomains ? 2 : 0) | (options.allowIcannDomains ? 1 : 0);
      if (walk(hostname, exceptionsRoot, allowedMask)) {
        out.isIcann = (nodeFlags[matchNode] & 1) !== 0;
        out.isPrivate = (nodeFlags[matchNode] & 2) !== 0;
        out.publicSuffix = hostname.slice(matchEnd + 1);
        return;
      }
      if (walk(hostname, rulesRoot, allowedMask)) {
        out.isIcann = (nodeFlags[matchNode] & 1) !== 0;
        out.isPrivate = (nodeFlags[matchNode] & 2) !== 0;
        out.publicSuffix = hostname.slice(matchStart);
        return;
      }
      out.isIcann = false;
      out.isPrivate = false;
      const lastDot = hostname.lastIndexOf(".");
      out.publicSuffix = lastDot === -1 ? hostname : hostname.slice(lastDot + 1);
    }
    var RESULT = getEmptyResult();
    function parse(url, options) {
      return parseImpl(url, 5, suffixLookup, options, getEmptyResult());
    }
    function getHostname(url, options) {
      resetResult(RESULT);
      return parseImpl(url, 0, suffixLookup, options, RESULT).hostname;
    }
    function getPublicSuffix(url, options) {
      resetResult(RESULT);
      return parseImpl(url, 2, suffixLookup, options, RESULT).publicSuffix;
    }
    function getDomain2(url, options) {
      resetResult(RESULT);
      return parseImpl(url, 3, suffixLookup, options, RESULT).domain;
    }
    function getFullDomain(url, options) {
      resetResult(RESULT);
      const result = parseImpl(url, 3, suffixLookup, options, RESULT);
      return result.domain === null ? null : result.hostname;
    }
    function getSubdomain(url, options) {
      resetResult(RESULT);
      return parseImpl(url, 4, suffixLookup, options, RESULT).subdomain;
    }
    function getDomainWithoutSuffix(url, options) {
      resetResult(RESULT);
      return parseImpl(url, 5, suffixLookup, options, RESULT).domainWithoutSuffix;
    }
    exports.getDomain = getDomain2;
    exports.getDomainWithoutSuffix = getDomainWithoutSuffix;
    exports.getFullDomain = getFullDomain;
    exports.getHostname = getHostname;
    exports.getPublicSuffix = getPublicSuffix;
    exports.getSubdomain = getSubdomain;
    exports.parse = parse;
  }
});

// src/scan.ts
import { rmSync as rmSync3 } from "node:fs";
import { pathToFileURL } from "node:url";

// src/browser.ts
import { existsSync, mkdtempSync, rmSync } from "node:fs";
var import_tldts = __toESM(require_cjs(), 1);
import { delimiter, join } from "node:path";
var CheckError = class extends Error {
};
var MAC_APPS = [
  "Google Chrome.app/Contents/MacOS/Google Chrome",
  "Chromium.app/Contents/MacOS/Chromium",
  "Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "Brave Browser.app/Contents/MacOS/Brave Browser"
];
var LINUX_BINARIES = [
  "google-chrome",
  "google-chrome-stable",
  "chromium",
  "chromium-browser",
  "microsoft-edge",
  "brave-browser"
];
var WINDOWS_EXES = [
  "Google\\Chrome\\Application\\chrome.exe",
  "Microsoft\\Edge\\Application\\msedge.exe",
  "BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  "Chromium\\Application\\chrome.exe"
];
var findBrowser = () => {
  const override = process.env.COOKIEPAL_BROWSER;
  if (override) return existsSync(override) ? override : null;
  let candidates;
  if (process.platform === "darwin") {
    const roots = ["/Applications", join(process.env.HOME ?? "", "Applications")];
    candidates = roots.flatMap((root) => MAC_APPS.map((app) => join(root, app)));
  } else if (process.platform === "win32") {
    const roots = [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA];
    candidates = roots.filter((root) => root !== void 0).flatMap((root) => WINDOWS_EXES.map((exe) => join(root, exe)));
  } else {
    const dirs = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
    candidates = LINUX_BINARIES.flatMap((name) => dirs.map((dir) => join(dir, name)));
  }
  return candidates.find((path) => existsSync(path)) ?? null;
};

// node_modules/.pnpm/@cookiepal-oss+cookie-db@1.0.0/node_modules/@cookiepal-oss/cookie-db/dist/index.js
var cookies_default = [
  {
    name: "___ELEVAR_GTM_SUITE--",
    vendor: "Elevar",
    category: "analytics",
    wildcard: false,
    description: "Stores technical configuration and state for Elevar GTM Suite functionality."
  },
  {
    name: "__adroll",
    vendor: "AdRoll",
    category: "advertisement",
    wildcard: false,
    description: "Registers a unique ID that identifies a returning user's device. The ID is used for targeted ads."
  },
  {
    name: "__adroll_fpc",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Used to identify the visitor across visits and devices. This allows the website to present the visitor with relevant advertisement - The service is provided by third party advertisement hubs, which facilitate real-time bidding for advertisers."
  },
  {
    name: "__adroll_shared",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Collects data on the user across websites - This data is used to make advertisement more relevant."
  },
  {
    name: "__ar_v4",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Optimises ad display based on the user's movement combined and various advertiser bids for displaying user ads."
  },
  {
    name: "__atuvc",
    vendor: "AddThis",
    category: "analytics",
    wildcard: false,
    description: "This cookie is created and read by the AddThis social sharing widget which is commonly embedded in websites to enable visitors to share content with a range of networking and sharing platforms."
  },
  {
    name: "__atuvs",
    vendor: "AddThis",
    category: "analytics",
    wildcard: false,
    description: "This cookie is created and read by the AddThis social sharing widget which is commonly embedded in websites to enable visitors to share content with a range of networking and sharing platforms."
  },
  {
    name: "__cf_bm",
    vendor: "Cloudflare",
    category: "necessary",
    wildcard: false,
    description: "The __cf_bm cookie supports Cloudflare Bot Management by managing incoming traffic that matches criteria associated with bots. The cookie does not collect any personal data, and any information collected is subject to one-way encryption."
  },
  {
    name: "__cfduid",
    vendor: "Cloudflare",
    category: "necessary",
    wildcard: false,
    description: "The _cfduid cookie helps Cloudflare detect malicious visitors to our Customers\u2019 websites and minimizes blocking legitimate users. It may be placed on the devices of our customers' End Users to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It is necessary for supporting Cloudflare's security features."
  },
  {
    name: "__cflb",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "When enabling session affinity with Cloudflare Load Balancer, Cloudflare sets a __cflb cookie with a unique value on the first response to the requesting client. Cloudflare routes future requests to the same origin, optimizing network resource usage. In the event of a failover, Cloudflare sets a new __cflb cookie to direct future requests to the failover pool."
  },
  {
    name: "__cfruid",
    vendor: "Cloudflare",
    category: "necessary",
    wildcard: false,
    description: "This cookie is set by Cloudflare for rate limiting policies."
  },
  {
    name: "__cmpcc",
    vendor: "Consentmanager CMP",
    category: "necessary",
    wildcard: false,
    description: "Tests whether the visitor\u2019s browser supports cookies to ensure consent can be properly stored and managed."
  },
  {
    name: "__cmpcccu",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Consent Management Platform cookie storing user consent choices for GDPR compliance."
  },
  {
    name: "__cmpcccx",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Consent Management Platform cookie storing extended consent data for GDPR compliance."
  },
  {
    name: "__cmpconsent",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores the user's cookie consent preferences as set through the consent management platform."
  },
  {
    name: "__ctmid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "CallTrackingMetrics cookie storing a visitor ID for phone call tracking attribution."
  },
  {
    name: "__eoi",
    vendor: "Google AdSense",
    category: "advertisement",
    wildcard: false,
    description: "Used for security purposes by AdSense, AdSense for Search, Display & Video 360, Google Ad Manager, Google Ads"
  },
  {
    name: "__gads",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: `Google advertising cookie set on the website's domain (unlike the other Google advertising cookies that are set on doubleclick.net domain). According to Google the cookie "serves purposes such as measuring interactions with the ads on that domain and preventing the same ads from being shown to you too many times".`
  },
  {
    name: "__gpi",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Used by Google advertising services"
  },
  {
    name: "__gsas",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Display of personalized advertisements in the Google advertising network based on your pseudonymized surfing behavior collected via Google."
  },
  {
    name: "__Host-next-auth.csrf-token",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by NextAuth.js to store a CSRF (Cross-Site Request Forgery) token. This cookie protects login and authentication flows by ensuring that requests are made securely from the correct website."
  },
  {
    name: "__hssc",
    vendor: "HubSpot",
    category: "analytics",
    wildcard: false,
    description: "This cookie name is associated with websites built on the HubSpot platform. This cookie keeps track of sessions. This is used to determine if HubSpot should increment the session number and timestamps in the __hstc cookie. It contains the domain, viewCount (increments each pageView in a session), and session start timestamp."
  },
  {
    name: "__hssrc",
    vendor: "HubSpot",
    category: "analytics",
    wildcard: false,
    description: "This cookie name is associated with websites built on the HubSpot platform. Whenever HubSpot changes the session cookie, this cookie is also set to determine if the visitor has restarted their browser. If this cookie does not exist when HubSpot manages cookies, it is considered a new session."
  },
  {
    name: "__hstc",
    vendor: "HubSpot",
    category: "analytics",
    wildcard: false,
    description: "This cookie name is associated with websites built on the HubSpot platform. This is the main cookie for tracking visitors. It contains the domain, utk, initial timestamp (first visit), last timestamp (last visit), current timestamp (this visit), and session number (increments for each subsequent session)."
  },
  {
    name: "__insp_nv",
    vendor: "Inspectlet",
    category: "analytics",
    wildcard: false,
    description: "Inspectlet uses cookies to keep track of session information. These cookies are needed to accurately understand how visitors are navigating your website."
  },
  {
    name: "__insp_slim",
    vendor: "Inspectlet",
    category: "analytics",
    wildcard: false,
    description: "Used by Inspectlet to keep track of session information. These cookies are needed to accurately understand how visitors are navigating the website."
  },
  {
    name: "__insp_targlpt",
    vendor: "Inspectlet",
    category: "analytics",
    wildcard: false,
    description: "Used by Inspectlet to keep track of session information. These cookies are needed to accurately understand how visitors are navigating the website."
  },
  {
    name: "__insp_targlpu",
    vendor: "Inspectlet",
    category: "analytics",
    wildcard: false,
    description: "Used by Inspectlet to keep track of session information. These cookies are needed to accurately understand how visitors are navigating the website."
  },
  {
    name: "__insp_wid",
    vendor: "Inspectlet",
    category: "analytics",
    wildcard: false,
    description: "Inspectlet uses cookies to keep track of session information. These cookies are needed to accurately understand how visitors are navigating your website."
  },
  {
    name: "__kl_key",
    vendor: "Klaviyo",
    category: "advertisement",
    wildcard: false,
    description: "Used by Klaviyo to identify visitors who interact with Klaviyo-powered forms or emails on a website."
  },
  {
    name: "__kla_id",
    vendor: "Klaviyo",
    category: "advertisement",
    wildcard: false,
    description: "Set by Klaviyo and is used to  track and identify site visitors through an auto-generated ID. This cookie can temporarily hold personally identifiable information."
  },
  {
    name: "__kla_session",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Klaviyo session cookie tracking user activity for email marketing segmentation."
  },
  {
    name: "__kla_viewed",
    vendor: "Klaviyo",
    category: "advertisement",
    wildcard: false,
    description: "Used by Klaviyo to track viewed items and user interactions for marketing automation."
  },
  {
    name: "__kla_viewed_reviewed_items",
    vendor: "Klaviyo",
    category: "advertisement",
    wildcard: false,
    description: "Used by Klaviyo to track viewed items and user interactions for marketing automation."
  },
  {
    name: "__klarna_sdk_default-config",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Klarna payment SDK cookie storing default configuration settings for the checkout widget."
  },
  {
    name: "__klarna_sdk_identity-api",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Klarna payment SDK cookie storing identity API endpoint configuration data."
  },
  {
    name: "__klarna_sdk_version",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Klarna payment SDK cookie recording the current SDK version for compatibility checks."
  },
  {
    name: "__lc_cid",
    vendor: "LiveChat",
    category: "performance",
    wildcard: false,
    description: "These cookies are set by LiveChat  that provides online chat facility to the website."
  },
  {
    name: "__lc_cst",
    vendor: "LiveChat",
    category: "performance",
    wildcard: false,
    description: "Used by LiveChat to distinguish anonymously different visitors using LiveChat at different times in order to improve our service. For example, reconnect the last agent with who the customer has ever chatted."
  },
  {
    name: "__mguid_",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: true,
    description: "This cookie enables an anonymous ID to be assigned to your browser so that ad networks can show relevant ads based on past site visits."
  },
  {
    name: "__mpq",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Mixpanel queue cookie temporarily storing analytics events before sending to Mixpanel servers."
  },
  {
    name: "__next_scroll_",
    vendor: "Unknown",
    category: "necessary",
    wildcard: true,
    description: "Next.js cookie storing scroll position data for restoring scroll state on navigation."
  },
  {
    name: "__oauth_redirect_detector",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Used by LiveChat that provides online chat facility to the website."
  },
  {
    name: "__paypal_storage__",
    vendor: "Paypal",
    category: "necessary",
    wildcard: true,
    description: "Used by PayPal to store your account details or settings to enable its services."
  },
  {
    name: "__ph_opt_in_out_phc_yaSzHmIE6rwEQNlL83GwXvdKzCMEQXsBZ3Q9AaNcMpR",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "__RequestVerificationToken",
    vendor: "Microsoft ASP.Net",
    category: "necessary",
    wildcard: false,
    description: "This cookie is set by ASP.NET and improves the security of the web site. It prevents Cross-Site Request Forgery-attacks and does not contain any user information. It is automatically removed when you turn off your web browser."
  },
  {
    name: "__rtbh.lid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "RTB House remarketing cookie storing a visitor lead ID for personalized ad targeting."
  },
  {
    name: "__Secure-ENID",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Google enhanced network ID cookie used for signed-out user content personalization."
  },
  {
    name: "__Secure-next-auth.callback-url",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used to keep you securely logged in and remember your session while you browse the site."
  },
  {
    name: "__Secure-ROLLOUT_TOKEN",
    vendor: "YouTube",
    category: "advertisement",
    wildcard: false,
    description: "Used by YouTube to manage feature rollout and experimentation. It helps Google control which new features or interface changes are shown to users as part of testing and staged rollouts, ensuring consistent experience for a given user during an experiment."
  },
  {
    name: "__Secure-YNID",
    vendor: "YouTube",
    category: "advertisement",
    wildcard: false,
    description: "YouTube cookie used for ad targeting and personalization for signed-out users."
  },
  {
    name: "__smVID",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Smart AdServer cookie storing a visitor identifier for ad targeting and frequency capping."
  },
  {
    name: "__spdt",
    vendor: "Spotify",
    category: "advertisement",
    wildcard: false,
    description: "Used by Spotify to store a unique identifier for the user or browser. This identifier supports advertising campaigns by tracking ad interactions, measuring effectiveness, and enabling campaign optimization."
  },
  {
    name: "__ssid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a secure session identifier for user authentication and state persistence."
  },
  {
    name: "__storejs_",
    vendor: "ConvertBox",
    category: "advertisement",
    wildcard: true,
    description: "Set by ConvertBox to store visitor data in the browser. This cookie helps remember user interactions with popups and forms, such as whether a visitor has already seen or submitted them, so the same message is not shown repeatedly."
  },
  {
    name: "__stripe_mid",
    vendor: "Stripe",
    category: "necessary",
    wildcard: false,
    description: "Stripe is used to making credit card payments. Stripe uses a cookie to remember who you are and to enable the website to process payments without storing any credit card information on its own servers."
  },
  {
    name: "__stripe_sid",
    vendor: "Stripe",
    category: "necessary",
    wildcard: false,
    description: "Stripe is used to making credit card payments. Stripe uses a cookie to remember who you are and to enable the website to process payments without storing any credit card information on its own servers."
  },
  {
    name: "__test",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Browser capability test cookie used to verify cookies are enabled before setting others."
  },
  {
    name: "__tt_embed__mounting",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "TikTok embed cookie tracking the mounting state of embedded TikTok video widgets."
  },
  {
    name: "__tt_embed__storage_test",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "TikTok embed cookie testing storage availability before initializing the embed widget."
  },
  {
    name: "__upsales_v_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Upsales CRM cookie storing visitor data for B2B lead identification and tracking."
  },
  {
    name: "__utma",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: false,
    description: "This is a persistent cookie which expires in 2 years by default and distinguishes between users and sessions. It is used to track first visit, last visit, current visit, and number of visits to calculate new and returning visitor statistics. The cookie is updated every time data is sent to Google Analytics. The lifespan of the cookie can be customised by website owners."
  },
  {
    name: "__utmb",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: false,
    description: "Used to determines new sessions and visits and expires after 30 minutes. The cookie contains the timestamp of the exact moment in time when a visitor enters the website and is updated every time data is sent to Google Analytics. Any activity by a user within the 30 minute life span will count as a single visit, even if the user leaves and then returns to the site. A return after 30 minutes will count as a new visit, but a returning visitor."
  },
  {
    name: "__utmc",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: false,
    description: "Contains a timestamp of the exact moment in time when a visitor leaves the website. This works with _utmb to calculate when you close your browser to calculate how long a visit takes."
  },
  {
    name: "__utmt",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: false,
    description: "Used to throttle the request rate for the service (limit the collection of data on high traffic sites)"
  },
  {
    name: "__utmz",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: false,
    description: "This cookie keeps track of entry point into your website storing traffic source, medium, campaign, and search term used to land on your website - so Google Analytics can tell site owners where visitors came from when arriving on the site. The cookie has a life span of 6 months and is updated every time data is sent to Google Analytics."
  },
  {
    name: "__utmzz",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Extended UTM parameter tracking cookie storing campaign attribution data across sessions."
  },
  {
    name: "__utmzzses",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Session-level UTM parameter cookie storing campaign source data for the current visit."
  },
  {
    name: "__wpdm_client",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "WP Download Manager plugin cookie identifying the client for secure file download access."
  },
  {
    name: "__ym_tab_guid",
    vendor: "Yandex.Metrika",
    category: "analytics",
    wildcard: false,
    description: "Yandex.Metrika cookie storing a unique identifier for the current browser tab."
  },
  {
    name: "__zlcmid",
    vendor: "Zendesk",
    category: "performance",
    wildcard: false,
    description: "This cookie is used by Zendesk to enable cookie consent for the Chat widget & & Web SDK"
  },
  {
    name: "__zlcstore",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Zopim/Zendesk Live Chat cookie storing chat widget state and conversation data."
  },
  {
    name: "_abck",
    vendor: "Akamai",
    category: "necessary",
    wildcard: false,
    description: "Akamai bot manager / Fraud prevention"
  },
  {
    name: "_ALGOLIA",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Algolia search analytics cookie storing user interaction data with the search widget."
  },
  {
    name: "_an_uid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a unique user identifier for analytics tracking purposes."
  },
  {
    name: "_biano",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Biano price comparison platform cookie storing session data for product search tracking."
  },
  {
    name: "_cfuvid",
    vendor: "Cloudflare",
    category: "necessary",
    wildcard: false,
    description: "Used by Cloudflare WAF to distinguish individual users who share the same IP address and apply rate limits"
  },
  {
    name: "_CH_SESSID",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a secure session identifier for the CH platform authentication."
  },
  {
    name: "_CH_SID",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Preserves users states across page requests."
  },
  {
    name: "_clck",
    vendor: "Microsoft Clarity",
    category: "analytics",
    wildcard: false,
    description: "Persists the Clarity User ID and preferences, unique to that site, on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID."
  },
  {
    name: "_clsk",
    vendor: "Microsoft Clarity",
    category: "analytics",
    wildcard: false,
    description: "Connects multiple page views by a user into a single Clarity session recording."
  },
  {
    name: "_cltk",
    vendor: "Microsoft Clarity",
    category: "analytics",
    wildcard: false,
    description: "This cookie is installed by Microsoft Clarity tool and stores information about how visitors use the website"
  },
  {
    name: "_cmp_a",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by Shopify for managing customer privacy settings."
  },
  {
    name: "_cohortId",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the cohort identifier for A/B test or user segment assignment."
  },
  {
    name: "_conv_s",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Convert.com A/B testing cookie storing session-level experiment assignment data."
  },
  {
    name: "_conv_v",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Convert.com A/B testing cookie storing visitor-level experiment assignment and goal data."
  },
  {
    name: "_cs_c",
    vendor: "Contentsquare",
    category: "analytics",
    wildcard: false,
    description: "Stores the visitor\u2019s consent choice to enable or disable analytics tracking as requested."
  },
  {
    name: "_cs_id",
    vendor: "Contentsquare",
    category: "analytics",
    wildcard: false,
    description: "Recognizes returning visitors to enable aggregated analytics and improve user experience."
  },
  {
    name: "_cs_s",
    vendor: "Contentsquare",
    category: "analytics",
    wildcard: false,
    description: "Tracks the number of pages viewed in a session to analyze visitor behavior and improve website experience."
  },
  {
    name: "_csrf",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by many systems for Cross Site Request Forgery protection."
  },
  {
    name: "_csrfToken",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Helps protect the website by verifying that actions (like form submissions) are made by you and not by malicious requests."
  },
  {
    name: "_dc_gtm_",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: true,
    description: "Used to throttle request rate. If Google Analytics is deployed via Google Tag Manager"
  },
  {
    name: "_dcid",
    vendor: "Stape (server-side tagging)",
    category: "analytics",
    wildcard: false,
    description: "Used by Stape to assign a unique identifier that links browser requests to a server-side tagging endpoint. It supports the operation of server-side tracking by enabling request routing, debugging, and data transmission between the client and server environment."
  },
  {
    name: "_dd_s",
    vendor: "Datadog",
    category: "analytics",
    wildcard: false,
    description: "This cookie is set by Datadog to group all events generated from a unique user session across multiple pages. It contains the current session ID, whether the session is excluded due to sampling, and the expiration date of the session. The cookie is extended for an extra 15 minutes every time the user interacts with the website, up to the maximum user session duration (4 hours)."
  },
  {
    name: "_fai__ga_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Stores combined Firebase Analytics and Google Analytics identifier data."
  },
  {
    name: "_fbp",
    vendor: "Meta Pixel",
    category: "advertisement",
    wildcard: false,
    description: "Facebook Pixel advertising first-party cookie. Used by Facebook to track visits across websites to deliver a series of advertisement products such as real time bidding from third party advertisers."
  },
  {
    name: "_fs_lua",
    vendor: "FullStory",
    category: "analytics",
    wildcard: false,
    description: "Captures the timestamp of the last user action to manage session lifecycle."
  },
  {
    name: "_fs_tab_id",
    vendor: "FullStory",
    category: "analytics",
    wildcard: false,
    description: "Identifies unique browser tabs to support multi-tab session playback."
  },
  {
    name: "_fs_uid",
    vendor: "FullStory",
    category: "analytics",
    wildcard: false,
    description: "Stores a unique visitor ID to link multiple sessions and page views for experience analytics. Required for session replay to work."
  },
  {
    name: "_fuid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a unique visitor identifier for cross-session user tracking."
  },
  {
    name: "_fw_crm_v",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Freshworks CRM cookie storing visitor data for lead identification and tracking."
  },
  {
    name: "_ga",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: false,
    description: "Contains a unique identifier used by Google Analytics to determine that two distinct hits belong to the same user across browsing sessions."
  },
  {
    name: "_ga_",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: true,
    description: "Contains a unique identifier used by Google Analytics 4 to determine that two distinct hits belong to the same user across browsing sessions."
  },
  {
    name: "_gat",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: false,
    description: "Used by Google Analytics to throttle request rate (limit the collection of data on high traffic sites)"
  },
  {
    name: "_gat_",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: true,
    description: "Used by Google Analytics to throttle request rate (limit the collection of data on high traffic sites)"
  },
  {
    name: "_gcl_au",
    vendor: "Google Ads",
    category: "advertisement",
    wildcard: false,
    description: "Used by Google AdSense to understand user interaction with the website by generating analytical data."
  },
  {
    name: "_gcl_ls",
    vendor: "Google Ads",
    category: "advertisement",
    wildcard: false,
    description: "Used by Google AdSense to understand user interaction with the website by generating analytical data."
  },
  {
    name: "_gd_session",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "6sense cookie that collects visitor data related to the user\u2019s visit to the website, such as number of visits, average time spent on the website and which pages have been loaded, for the purpose of serving targeted advertisements."
  },
  {
    name: "_gd_visitor",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "6sense cookie that collects visitor data related to the user\u2019s visit to the website, such as number of visits, average time spent on the website and which pages have been loaded, for the purpose of serving targeted advertisements."
  },
  {
    name: "_GESPSK-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Google Encrypted Search Partner Session Key cookie for encrypted search session management."
  },
  {
    name: "_gid",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: false,
    description: "Contains a unique identifier used by Google Analytics to determine that two distinct hits belong to the same user across browsing sessions."
  },
  {
    name: "_GRECAPTCHA",
    vendor: "Google reCaptcha",
    category: "necessary",
    wildcard: false,
    description: "Used by Google reCaptcha for risk analysis"
  },
  {
    name: "_gtmeec",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: false,
    description: "This cookie is set by Google Tag Manager as part of Event Enhancement. It is an HTTP-only, secure cookie used to enrich event data, improving event match quality and enabling more accurate conversion attribution to marketing campaigns."
  },
  {
    name: "_hjAbsoluteSessionInProgress",
    vendor: "Hotjar",
    category: "analytics",
    wildcard: false,
    description: "The cookie is set so Hotjar can track the beginning of the user's journey for a total session count. It does not contain any identifiable information."
  },
  {
    name: "_hjFirstSeen",
    vendor: "Hotjar",
    category: "analytics",
    wildcard: false,
    description: "This cookie is set by Hotjar to identify a new user\u2019s first session. It stores a true/false value, indicating whether this was the first time Hotjar saw this user. It is used by Recording filters to identify new user sessions."
  },
  {
    name: "_hjIncludedInPageviewSample",
    vendor: "Hotjar",
    category: "analytics",
    wildcard: false,
    description: "This cookie is set to let Hotjar know whether that visitor is included in the data sampling defined by your site's pageview limit."
  },
  {
    name: "_hjIncludedInSessionSample",
    vendor: "Hotjar",
    category: "analytics",
    wildcard: false,
    description: "This cookie is set to let Hotjar know whether that visitor is included in the data sampling defined by your site's daily session limit."
  },
  {
    name: "_hjIncludedInSessionSample_",
    vendor: "Hotjar",
    category: "analytics",
    wildcard: true,
    description: "This cookie is set to let Hotjar know whether that visitor is included in the data sampling defined by your site's daily session limit."
  },
  {
    name: "_hjSession_",
    vendor: "Hotjar",
    category: "analytics",
    wildcard: true,
    description: "Used by Hotjar to hold current session data."
  },
  {
    name: "_hjSessionUser_",
    vendor: "Hotjar",
    category: "analytics",
    wildcard: true,
    description: "Hotjar cookie. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the Hotjar User ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID."
  },
  {
    name: "_hp2_id.",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Heap analytics cookie storing the unique visitor identifier for user behavior tracking."
  },
  {
    name: "_hp2_ses_props.",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Heap analytics cookie storing session properties for user behavior analysis."
  },
  {
    name: "_icl_current_language",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by WPML to store the current language."
  },
  {
    name: "_icl_visitor_lang_js",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "WPML multilingual plugin cookie storing the visitor's language selection."
  },
  {
    name: "_iub_cs-",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by iubenda to store consent preferences"
  },
  {
    name: "_koko_analytics_pages_viewed",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Koko Analytics plugin cookie tracking which pages have been viewed in the session."
  },
  {
    name: "_landing_page",
    vendor: "Shopify",
    category: "analytics",
    wildcard: false,
    description: "Used by Shopify to track landing pages."
  },
  {
    name: "_lb",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Load balancer affinity cookie routing requests to the same backend server."
  },
  {
    name: "_lb_ccc",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores cookie consent or load balancer configuration data."
  },
  {
    name: "_lb_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a unique identifier for load balancer session affinity."
  },
  {
    name: "_lfa",
    vendor: "Leadfeeder",
    category: "analytics",
    wildcard: false,
    description: "Used by Leadfeeder to collect behavioral data of all website visitors. This includes: pages viewed, visitor source and time spent on the site."
  },
  {
    name: "_lfa_expiry",
    vendor: "Leadfeeder",
    category: "analytics",
    wildcard: false,
    description: "Stores cookie expiry to maintain visitor tracking for lead generation and marketing."
  },
  {
    name: "_li_id.",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "LinkedIn Insight Tag cookie storing a unique user identifier for LinkedIn analytics."
  },
  {
    name: "_li_ses.",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "LinkedIn Insight Tag session cookie tracking the current user session activity."
  },
  {
    name: "_lscache_vary",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by Litespeed to determine if a cached page should be served or not."
  },
  {
    name: "_mcnc",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a unique non-cookied visitor identifier for analytics fallback tracking."
  },
  {
    name: "_mgDimsData",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores Merchant Gateway dimensional data for e-commerce tracking."
  },
  {
    name: "_mkto_trk",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is associated with an email marketing service provided by Marketo. This tracking cookie allows a website to link visitor behavior to the recipient of an email marketing campaign, to measure campaign effectiveness."
  },
  {
    name: "_nav_path",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user's navigation path for session-based analytics or breadcrumb tracking."
  },
  {
    name: "_nss",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a new session signal flag for analytics session detection."
  },
  {
    name: "_omappvp",
    vendor: "OptinMonster",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is set by OptinMonster and is used for determining new vs. returning visitors."
  },
  {
    name: "_omappvs",
    vendor: "OptinMonster",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is set by OptinMonster and is used to determine when a new visitor becomes a returning visitor."
  },
  {
    name: "_orig_referrer",
    vendor: "Shopify",
    category: "analytics",
    wildcard: false,
    description: "Used by Shopify to track landing pages."
  },
  {
    name: "_pandectes_gdpr",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Pandectes GDPR app cookie storing user consent preferences for Shopify stores."
  },
  {
    name: "_pay_session",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores payment session data during the e-commerce checkout process."
  },
  {
    name: "_pcid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a persistent cookie identifier for cross-session user tracking."
  },
  {
    name: "_pctx",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a persistent context identifier for user session management."
  },
  {
    name: "_pin_unauth",
    vendor: "Pinterest",
    category: "analytics",
    wildcard: false,
    description: "Used by Pinterest to group actions for users who cannot be identified by Pinterest."
  },
  {
    name: "_pinterest_ct_ua",
    vendor: "Pinterest",
    category: "analytics",
    wildcard: false,
    description: "Used by Pinterest to store a user ID and the timestamp at which the cookie was created."
  },
  {
    name: "_pk_id.",
    vendor: "Matomo",
    category: "analytics",
    wildcard: false,
    description: "Used by Matomo to store a few details about the user such as the unique visitor ID"
  },
  {
    name: "_pk_ses.",
    vendor: "Matomo",
    category: "analytics",
    wildcard: false,
    description: "Short lived cookies used by Matomo to temporarily store data for the visit"
  },
  {
    name: "_policy",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores user policy acknowledgment or privacy setting preferences."
  },
  {
    name: "_pwLogger:",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Logger cookie storing price tracking or audit log data for debugging."
  },
  {
    name: "_rdt_em",
    vendor: "Reddit",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is set by the Reddit Pixel to store event match information. It helps Reddit attribute website actions to advertising campaigns and optimize ad delivery."
  },
  {
    name: "_rdt_uuid",
    vendor: "Reddit",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is set by the Reddit Pixel to store event match information. It helps Reddit attribute website actions to advertising campaigns and optimize ad delivery."
  },
  {
    name: "_reb2bgeo",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Reb2b B2B visitor identification cookie storing geographic data for company identification."
  },
  {
    name: "_reb2bsessionID",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Reb2b session cookie storing a session identifier for B2B visitor tracking."
  },
  {
    name: "_reb2buid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Reb2b cookie storing a unique visitor identifier for B2B company identification."
  },
  {
    name: "_rxuuid",
    vendor: "Adform",
    category: "advertisement",
    wildcard: false,
    description: "Used by Adform and its partners to identify a visitor to serve relevant advertising."
  },
  {
    name: "_s",
    vendor: "Shopify",
    category: "analytics",
    wildcard: false,
    description: "Shopify analytics."
  },
  {
    name: "_scc_session",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a session identifier for Snapchat Conversions API tracking."
  },
  {
    name: "_ScCbts",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Snapchat Click-to-Buy cookie storing conversion tracking data."
  },
  {
    name: "_scid",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Snapchat pixel unique ID of the user, similar to how the _ga cookie works with Google Analytics"
  },
  {
    name: "_scid_r",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Snapchat Pixel cookie storing a referral-specific click identifier for attribution."
  },
  {
    name: "_session_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user session identifier to maintain login state across page loads."
  },
  {
    name: "_shop_app_essential",
    vendor: "Shop App",
    category: "necessary",
    wildcard: false,
    description: "Supports essential features and secure session handling when the store is accessed through the Shop mobile app."
  },
  {
    name: "_shopify_essential",
    vendor: "Shopify",
    category: "necessary",
    wildcard: false,
    description: "Supports essential shopping functionality and checkout process."
  },
  {
    name: "_shopify_s",
    vendor: "Shopify",
    category: "analytics",
    wildcard: false,
    description: "Shopify analytics."
  },
  {
    name: "_shopify_sa_p",
    vendor: "Shopify",
    category: "advertisement",
    wildcard: false,
    description: "Shopify analytics relating to marketing & referrals."
  },
  {
    name: "_shopify_sa_t",
    vendor: "Shopify",
    category: "advertisement",
    wildcard: false,
    description: "Shopify analytics relating to marketing & referrals."
  },
  {
    name: "_shopify_y",
    vendor: "Shopify",
    category: "analytics",
    wildcard: false,
    description: "Shopify analytics."
  },
  {
    name: "_shs_state",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores social sharing state data for tracking share widget interactions."
  },
  {
    name: "_sm_bot",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "_sm_bot_verify",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "_sn_a",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Set by Sleeknote for visitor analytics tracking. It sets a visitor ID so that the visitor can be identified across sessions."
  },
  {
    name: "_sn_m",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Used by Sleeknote and contains information used for marketing related targeting options. Targeting options like the referrer, UTM, or geo-location."
  },
  {
    name: "_sn_n",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "This is the necessary cookie set by Sleeknote, as it contains technical information so that the campaigns can show properly and tracking works properly."
  },
  {
    name: "_snow_id.",
    vendor: "Snowplow",
    category: "analytics",
    wildcard: false,
    description: "Used by Snowplow to identify if the user is in an active session on a site or if this is a new session for a user (i.e. cookie doesn\u2019t exist or has expired)."
  },
  {
    name: "_snow_ses.",
    vendor: "Snowplow",
    category: "analytics",
    wildcard: false,
    description: "Used by Snowplow to store user information that is created when a user first visits a site and updated on subsequent visits. It is used to identify users and track the users activity across a domain. This cookie stores a unique identifier for each user, a unique identifier for the users current session, the number of visits a user has made to the site, the timestamp of the users first visit, the timestamp of their previous visit and the timestamp of their current visit."
  },
  {
    name: "_snrs_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "SALESmanago/Synerise marketing automation cookie storing visitor session and tracking data."
  },
  {
    name: "_sp_id.",
    vendor: "Snowplow",
    category: "analytics",
    wildcard: false,
    description: "Used by Snowplow to identify if the user is in an active session on a site or if this is a new session for a user (i.e. cookie doesn\u2019t exist or has expired)."
  },
  {
    name: "_sp_ses.",
    vendor: "Snowplow",
    category: "analytics",
    wildcard: false,
    description: "Used by Snowplow to store user information that is created when a user first visits a site and updated on subsequent visits. It is used to identify users and track the users activity across a domain. This cookie stores a unique identifier for each user, a unique identifier for the users current session, the number of visits a user has made to the site, the timestamp of the users first visit, the timestamp of their previous visit and the timestamp of their current visit."
  },
  {
    name: "_swa_u",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a unique user identifier for SWA platform session tracking."
  },
  {
    name: "_tab_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a unique identifier for the current browser tab to prevent duplicate analytics events."
  },
  {
    name: "_tab_ids",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores identifiers for multiple browser tabs to coordinate cross-tab session state."
  },
  {
    name: "_tccl_visit",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "TCCL tracking cookie recording visit data for conversion and attribution analytics."
  },
  {
    name: "_tccl_visitor",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "TCCL tracking cookie storing visitor identifier for cross-session attribution."
  },
  {
    name: "_tracking_consent",
    vendor: "Shopify",
    category: "necessary",
    wildcard: false,
    description: "Used by Shopify to store a user's preferences if a merchant has set up privacy rules in the visitor's region."
  },
  {
    name: "_tt_enable_cookie",
    vendor: "TikTok Pixel",
    category: "advertisement",
    wildcard: false,
    description: "TikTok Pixel uses this cookie to check whether cookies can be enabled for tracking and attribution."
  },
  {
    name: "_ttp",
    vendor: "TikTok Pixel",
    category: "advertisement",
    wildcard: false,
    description: "Used by Tiktok to measure and improve the performance of advertising campaigns and to personalize the user's experience (including ads) on TikTok."
  },
  {
    name: "_uetsid",
    vendor: "Microsoft Ads",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is used by Bing to determine what ads should be shown that may be relevant to the end user perusing the site."
  },
  {
    name: "_uetsid_exp",
    vendor: "Microsoft Ads",
    category: "advertisement",
    wildcard: false,
    description: "This is a cookie utilised by Microsoft Bing Ads and is a tracking cookie. It allows us to engage with a user that has previously visited our website."
  },
  {
    name: "_uetvid",
    vendor: "Microsoft Ads",
    category: "advertisement",
    wildcard: false,
    description: "Used by Microsoft Advertising to store a unique, anonymized visitor ID to personalize marketing."
  },
  {
    name: "_uetvid_exp",
    vendor: "Microsoft Ads",
    category: "advertisement",
    wildcard: false,
    description: "This is a cookie utilised by Microsoft Bing Ads and is a tracking cookie. It allows us to engage with a user that has previously visited our website."
  },
  {
    name: "_uid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a unique user identifier for personalization and analytics purposes."
  },
  {
    name: "_vis_opt_exp_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Visual Website Optimizer A/B test cookie storing the experiment variant assigned to the user."
  },
  {
    name: "_vis_opt_s",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "The number of times the browser was closed and reopened. Tracks sessions created for a user. (VWO)"
  },
  {
    name: "_vis_opt_test_cookie",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Session cookie generated to detect if the cookies are enabled on the browser of the user or not. It also helps in tracking the number of browser sessions a visitor has gone through. (VWO)"
  },
  {
    name: "_vwo_ds",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Stores persistent user-level data for Track (goals, funnels) and Analyze (heatmaps, recordings, form analytics) (VWO)"
  },
  {
    name: "_vwo_nls_q_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "VWO cookie storing notification queue data for NLS experiment display logic."
  },
  {
    name: "_vwo_sn",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores session-level information. (VWO)"
  },
  {
    name: "_vwo_uuid",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "It generates a unique id for every visitor and is used for the report segmentation feature in VWO, and it also allows you to view data in a more refined manner. (VWO)"
  },
  {
    name: "_vwo_uuid_v2",
    vendor: "Visual Website Optimizer",
    category: "analytics",
    wildcard: false,
    description: "Calculates Unique Traffic On a website"
  },
  {
    name: "_website_stats",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "used to collect aggregated visitor statistics and analyze how users interact with the website. Supports reporting of page views, visits, and session data to help site owners improve site performance and content."
  },
  {
    name: "_wpfuuid",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores a unique user ID to track form submissions anonymously, helping site owners link entries from the same user without requiring login or personal information."
  },
  {
    name: "_xsd",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores cross-site data for analytics cross-domain tracking."
  },
  {
    name: "_y",
    vendor: "Shopify",
    category: "analytics",
    wildcard: false,
    description: "Shopify analytics."
  },
  {
    name: "_ym",
    vendor: "Yandex.Metrika",
    category: "analytics",
    wildcard: false,
    description: "Used by Yandex Metrica to identify users, determine number of requests and calculate accurate bounce rate."
  },
  {
    name: "_ym_d",
    vendor: "Yandex.Metrika",
    category: "analytics",
    wildcard: false,
    description: "Used by Yandex.Metrika to save the date of the user's first site session"
  },
  {
    name: "_ym_isad",
    vendor: "Yandex.Metrika",
    category: "analytics",
    wildcard: false,
    description: "Used by Yandex.Metrika to determine whether a user has ad blockers"
  },
  {
    name: "_ym_uid",
    vendor: "Yandex.Metrika",
    category: "analytics",
    wildcard: false,
    description: "Used by Yandex.Metrika to identify site users"
  },
  {
    name: "_ym_visorc",
    vendor: "Yandex.Metrika",
    category: "analytics",
    wildcard: false,
    description: "This cookie is set by Yandex.Metrika and is used for web analytics. It contains a unique identifier that is assigned to each browser to track user interaction with the website."
  },
  {
    name: "_zitok",
    vendor: "ZoomInfo",
    category: "analytics",
    wildcard: false,
    description: "This cookie stores a unique identifier for each visitor. It allows ZoomInfo to recognize returning users across sessions, helping the service maintain accurate visitor records and support analytics."
  },
  {
    name: ".AspNetCore.Antiforgery.",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores an anti-forgery (CSRF) token to verify that form submissions and requests come from the legitimate user, protecting against cross-site request forgery attacks."
  },
  {
    name: ".AspNetCore.Correlation.",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "ASP.NET Core CSRF correlation cookie used to prevent cross-site request forgery attacks."
  },
  {
    name: ".AspNetCore.Mvc.CookieTempDataProvider",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Enables temporary storage of data between pages to support core site functionality like redirects and user messages."
  },
  {
    name: ".Nop.Antiforgery",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by nopCommerce to prevent Cross-Site Request Forgery attacks."
  },
  {
    name: ".Nop.Culture",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by nopCommerce to store language selection."
  },
  {
    name: ".Nop.Customer",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by nopCommerce to store reference to customer."
  },
  {
    name: "$last_referrer",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used to store referrer information to understand how visitors arrive at the website."
  },
  {
    name: "$referrer",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used to store referrer information to understand how visitors arrive at the website."
  },
  {
    name: "A3",
    vendor: "Yahoo Gemini",
    category: "advertisement",
    wildcard: false,
    description: "Used by Yahoo for content and advertising personalisation."
  },
  {
    name: "ab",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "This cookie generates targeted ads by registering the user's movements across websites. The cookie is issued by Aggregate Knowledge"
  },
  {
    name: "ab.storage.",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Braze SDK cookie storing persistent user data for in-app messaging and analytics."
  },
  {
    name: "abj404_solution_REQUEST_URI",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ABJ 404 Solution WordPress plugin cookie storing the original 404 request URI for redirect logging."
  },
  {
    name: "abj404_solution_REQUEST_URI_SHORT",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ABJ 404 Solution plugin cookie storing the shortened version of the 404 request URI."
  },
  {
    name: "abj404_solution_REQUEST_URI_UPDATE_URL",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ABJ 404 Solution plugin cookie storing the destination URL for 404 redirect handling."
  },
  {
    name: "ac_enable_tracking",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ActiveCampaign cookie recording whether tracking has been enabled for the visitor."
  },
  {
    name: "activechatyWidgets",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores state and configuration for the activeChat floating widget session."
  },
  {
    name: "ad-id",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is generally provided by amazon-adsystem.com for advertising purposes."
  },
  {
    name: "ad-privacy",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is generally provided by amazon-adsystem.com for advertising purposes."
  },
  {
    name: "adcpers",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "AdClerks advertising cookie storing persistent user data for ad personalization."
  },
  {
    name: "addevent_track_cookie",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "AddEvent tracking cookie recording user interactions with event calendar widgets."
  },
  {
    name: "adroll_dqs",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "AdRoll cookie storing data quality signals to improve ad targeting accuracy."
  },
  {
    name: "adroll_flgs",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "AdRoll cookie storing feature flags for the retargeting pixel configuration."
  },
  {
    name: "AEC",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Google anti-spam cookie ensuring requests in Google services come from legitimate browser sessions."
  },
  {
    name: "AFFICHE_W",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by the advertising platform Weborama to determine the visitor\u2019s interests based on pages visits, content clicked and other actions on the website."
  },
  {
    name: "ahoy_unique_",
    vendor: "POWR",
    category: "analytics",
    wildcard: true,
    description: "This cookie is set by POWR for analytical purposes."
  },
  {
    name: "ahoy_visit",
    vendor: "POWR",
    category: "analytics",
    wildcard: false,
    description: "This cookie is set by POWR for analytical purposes."
  },
  {
    name: "ahoy_visitor",
    vendor: "POWR",
    category: "analytics",
    wildcard: false,
    description: "This cookie is set by POWR for analytical purposes."
  },
  {
    name: "AI_buffer",
    vendor: "Azure Application Insights",
    category: "analytics",
    wildcard: false,
    description: "Stores queued telemetry events locally when network issues occur, ensuring data is sent reliably once connectivity is restored."
  },
  {
    name: "AI_sentBuffer",
    vendor: "Azure Application Insights",
    category: "analytics",
    wildcard: false,
    description: "Tracks which telemetry events were sent to avoid duplicate submissions when retrying after temporary failures."
  },
  {
    name: "ai_session",
    vendor: "Microsoft Application Insights",
    category: "necessary",
    wildcard: false,
    description: "Preserves users states across page requests."
  },
  {
    name: "ai_user",
    vendor: "Azure Application Insights",
    category: "analytics",
    wildcard: false,
    description: "Used by Azure Application Insights to collect statistical usage and telemetry data. Stores a unique ID to recognize users on returning visits, helping analyze behavior, monitor performance, and identify issues."
  },
  {
    name: "ajs_anonymous_id",
    vendor: "Segment",
    category: "analytics",
    wildcard: false,
    description: "This cookie is used to aggregate and segment data to different data tracking tools by Segment"
  },
  {
    name: "ajs_user_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Segment analytics cookie storing the identified user ID for cross-session tracking."
  },
  {
    name: "ak_bmsc",
    vendor: "Akamai",
    category: "performance",
    wildcard: false,
    description: "This cookie is used by Akamai to optimize site security by distinguishing between humans and bots. bm_sv. This cookie is necessary for the Akamai cache function. A cache is used by the website to optimize the response time between the visitor and the website."
  },
  {
    name: "algoliasearch-client-js",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "A Squarespace cookie that adds auto-populated suggestions to address fields in Scheduling to help clients complete forms faster."
  },
  {
    name: "am_tokens",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores tokens for attribution management and ad performance tracking."
  },
  {
    name: "am_tokens_eu-v1",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "EU-specific attribution management tokens for GDPR-compliant ad tracking."
  },
  {
    name: "AMCV_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Adobe Marketing Cloud Visitor ID cookie storing the visitor identifier for Adobe analytics."
  },
  {
    name: "AMCVS_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Adobe Marketing Cloud Visitor Session cookie storing session-level visitor data."
  },
  {
    name: "AMP_MKTG_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Amplitude marketing analytics cookie storing attribution and campaign tracking data."
  },
  {
    name: "AMP_unsent_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Amplitude analytics cookie temporarily buffering events not yet sent to Amplitude servers."
  },
  {
    name: "amplitude_unsent_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Amplitude analytics cookie temporarily buffering events not yet sent to Amplitude servers."
  },
  {
    name: "AnalyticsSyncHistory",
    vendor: "LinkedIn Insight",
    category: "advertisement",
    wildcard: false,
    description: "Used by LinkedIn to store information about the time a sync with the lms_analytics cookie took place for users in the Designated Countries"
  },
  {
    name: "anj",
    vendor: "AppNexus",
    category: "advertisement",
    wildcard: false,
    description: "Used by AppNexus and contains data denoting whether a cookie ID is synced with their partners."
  },
  {
    name: "ANONCHK",
    vendor: "Microsoft Ads",
    category: "advertisement",
    wildcard: false,
    description: "Used to store session ID for a users session to ensure that clicks from adverts on the Bing search engine are verified for reporting purposes and for personalisation"
  },
  {
    name: "apbct_cookies_test",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Set by the CleanTalk Anti-Spam plugin to distinguish between legitimate users and automated bots"
  },
  {
    name: "apbct_headless",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Set by the CleanTalk Anti-Spam plugin to distinguish between legitimate users and automated bots"
  },
  {
    name: "apbct_iframes_protected",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Set by the CleanTalk Anti-Spam plugin to distinguish between legitimate users and automated bots"
  },
  {
    name: "apbct_page_hits",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Set by the CleanTalk Anti-Spam plugin to distinguish between legitimate users and automated bots"
  },
  {
    name: "apbct_pixel_url",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Set by the CleanTalk Anti-Spam plugin to distinguish between legitimate users and automated bots"
  },
  {
    name: "apbct_prev_referer",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Set by the CleanTalk Anti-Spam plugin to distinguish between legitimate users and automated bots"
  },
  {
    name: "apbct_session_current_page",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Set by the CleanTalk Anti-Spam plugin to distinguish between legitimate users and automated bots"
  },
  {
    name: "apbct_session_id",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Set by the CleanTalk Anti-Spam plugin to distinguish between legitimate users and automated bots"
  },
  {
    name: "apbct_site_landing_ts",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Set by the CleanTalk Anti-Spam plugin to distinguish between legitimate users and automated bots"
  },
  {
    name: "apbct_site_referer",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Set by the CleanTalk Anti-Spam plugin to distinguish between legitimate users and automated bots"
  },
  {
    name: "apbct_timestamp",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Set by the CleanTalk Anti-Spam plugin to distinguish between legitimate users and automated bots"
  },
  {
    name: "apbct_visible_fields",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Set by the CleanTalk Anti-Spam plugin to distinguish between legitimate users and automated bots"
  },
  {
    name: "apolloAnonId",
    vendor: "Apollo.io",
    category: "advertisement",
    wildcard: false,
    description: "Assigns a unique anonymous ID to visitors to enable Apollo.io to track site activity, support lead generation, and improve sales intelligence without storing direct personal information."
  },
  {
    name: "ar_debug",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Enable/disable attribution report debugging. Attribution reporting is a Google Privacy Sandbox feature to measure conversions without third-party cookies."
  },
  {
    name: "arcki2",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Profiling cookie set by Audiencerate"
  },
  {
    name: "arcki2_adform",
    vendor: "Adform",
    category: "advertisement",
    wildcard: false,
    description: "Used by Adform and its partners to identify a visitor to serve relevant advertising."
  },
  {
    name: "arcki2_ddp2",
    vendor: "Adform",
    category: "advertisement",
    wildcard: false,
    description: "Used by Adform and its partners to identify a visitor to serve relevant advertising."
  },
  {
    name: "ARRAffinity",
    vendor: "Windows Azure",
    category: "necessary",
    wildcard: false,
    description: "This cookie is set by websites run on the Windows Azure cloud platform. It is used for load balancing to make sure the visitor page requests are routed to the same server in any browsing session."
  },
  {
    name: "ARRAffinitySameSite",
    vendor: "Windows Azure",
    category: "necessary",
    wildcard: false,
    description: "Used to distribute traffic to the website on several servers in order to optimize response times."
  },
  {
    name: "ASP.NET_SessionId",
    vendor: "Microsoft ASP.Net",
    category: "necessary",
    wildcard: false,
    description: "Used by Microsoft ASP.Net web applications to maintain anonymous user's session state between page views"
  },
  {
    name: "ASPSESSIONID",
    vendor: "Microsoft ASP.Net",
    category: "necessary",
    wildcard: false,
    description: "Used by Microsoft ASP.Net web applications to maintain anonymous user's session state between page views"
  },
  {
    name: "attribution_user_id",
    vendor: "Typeform",
    category: "analytics",
    wildcard: false,
    description: "Used by Typeform in context with the website\u2019s pop-up questionnaires and messengering."
  },
  {
    name: "AUTH_SESSION_ID",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores the authenticated session identifier for secure user login sessions."
  },
  {
    name: "auth.strategy",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records the authentication strategy used (e.g., OAuth, password) for the current session."
  },
  {
    name: "AVPUID",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a unique visitor identifier for advertising platform targeting purposes."
  },
  {
    name: "aws-waf-token",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "AWS Web Application Firewall token cookie used to validate legitimate browser requests."
  },
  {
    name: "AWSALB",
    vendor: "AWS Elastic Load Balancing",
    category: "necessary",
    wildcard: false,
    description: "Maintains session stickiness and secure routing between the user and backend servers through AWS load balancing."
  },
  {
    name: "AWSALBCORS",
    vendor: "AWS Elastic Load Balancing",
    category: "necessary",
    wildcard: false,
    description: "Maintains session stickiness and secure routing between the user and backend servers through AWS load balancing."
  },
  {
    name: "AWSALBTG",
    vendor: "AWS Elastic Load Balancing",
    category: "necessary",
    wildcard: false,
    description: "Used by Target Group-based load balancers for session stickiness."
  },
  {
    name: "AWSALBTGCORS",
    vendor: "AWS Elastic Load Balancing",
    category: "necessary",
    wildcard: false,
    description: "Used by Target Group-based load balancers for session stickiness."
  },
  {
    name: "AWSELBCORS",
    vendor: "Amazon Web Services",
    category: "necessary",
    wildcard: false,
    description: "This cookie is managed by AWS and is used for load balancing."
  },
  {
    name: "axeptio_all_vendors",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Axeptio CMP cookie storing all vendor consent statuses for GDPR compliance."
  },
  {
    name: "axeptio_authorized_vendors",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Axeptio CMP cookie storing the list of vendors the user has consented to."
  },
  {
    name: "axeptio_cookies",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Axeptio CMP cookie storing the user's cookie consent preferences."
  },
  {
    name: "ayl_visitor",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Stores a visitor identifier for the AYL recommendation engine tracking."
  },
  {
    name: "b24_crm_guest_pages",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bitrix24 CRM cookie tracking pages visited by guest users for lead scoring."
  },
  {
    name: "b24_crm_guest_utm",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bitrix24 CRM cookie storing UTM parameters for guest visitor attribution."
  },
  {
    name: "ba_sid",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores a session identifier for tracking user sessions on the site."
  },
  {
    name: "bcookie",
    vendor: "LinkedIn Insight",
    category: "analytics",
    wildcard: false,
    description: "This is a Microsoft MSN 1st party cookie for sharing the content of the website via social media."
  },
  {
    name: "bh",
    vendor: "Yandex.Metrika",
    category: "analytics",
    wildcard: false,
    description: "Used by Yandex.Metrica to store browser or session identifiers for collecting aggregated visitor statistics, analyzing site usage patterns, and enabling traffic analysis across sessions."
  },
  {
    name: "BIGipServer",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Cookie used for connection persistence and routing the request to proper server in server pool"
  },
  {
    name: "bito",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is generally provided by bidr.io and is used for advertising purposes."
  },
  {
    name: "bitoIsSecure",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "The Beeswax technology allows our customers to buy ad space on websites, mobile apps, video players, and other devices and allows for the use of proprietary and third party data in the purchase of that ad space."
  },
  {
    name: "bm_sv",
    vendor: "Akamai",
    category: "necessary",
    wildcard: false,
    description: "Akamai bot manager / Fraud prevention"
  },
  {
    name: "bm_sz",
    vendor: "Akamai",
    category: "necessary",
    wildcard: false,
    description: "Akamai bot manager / Fraud prevention"
  },
  {
    name: "bokunSessionId_",
    vendor: "Unknown",
    category: "necessary",
    wildcard: true,
    description: "Cookie required for the website to function correctly and maintain session state."
  },
  {
    name: "bot_detector_browser_supports_cookies",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bot detection cookie verifying that the browser supports cookie storage."
  },
  {
    name: "bot_detector_cron_storage",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bot detection cookie storing scheduled task state for bot scoring."
  },
  {
    name: "bot_detector_event_token",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bot detection cookie storing an event token to verify interaction authenticity."
  },
  {
    name: "bot_detector_f_hash",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bot detection cookie storing a fingerprint hash to identify the browser environment."
  },
  {
    name: "bot_detector_headless",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bot detection cookie checking whether the browser is running in headless mode."
  },
  {
    name: "bot_detector_mouse_moved",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bot detection cookie recording whether mouse movement was detected on the page."
  },
  {
    name: "bot_detector_page_hits",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bot detection cookie counting page hits to detect abnormal crawling patterns."
  },
  {
    name: "bot_detector_pointer_data",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bot detection cookie storing pointer event data to distinguish humans from bots."
  },
  {
    name: "bot_detector_referrer",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bot detection cookie storing the referrer URL to detect spoofed or suspicious traffic."
  },
  {
    name: "bot_detector_referrer_previous",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bot detection cookie storing the previous referrer URL for traffic pattern analysis."
  },
  {
    name: "bot_detector_screen_info",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bot detection cookie storing screen resolution data to identify headless browser environments."
  },
  {
    name: "bot_detector_user_agent",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bot detection cookie storing the user agent string for browser authenticity verification."
  },
  {
    name: "bot_detector_webgl_support",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Bot detection cookie checking WebGL support to identify real browser rendering environments."
  },
  {
    name: "brave_page_visited",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records page visit data for Brave Rewards content verification and attribution."
  },
  {
    name: "breakdance_last_session_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Breakdance page builder cookie storing the last session ID for behavioral analytics."
  },
  {
    name: "breakdance_session_count",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Breakdance page builder cookie counting the number of sessions for behavioral analytics."
  },
  {
    name: "breakdance_view_count",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Breakdance page builder cookie counting page views for behavioral analytics."
  },
  {
    name: "BrevoConversations.clientId",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Brevo live chat cookie storing the client identifier for conversation continuity."
  },
  {
    name: "BrevoConversations.hostedItems",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Brevo live chat cookie storing hosted widget items configuration data."
  },
  {
    name: "BrevoConversations.lastPageViewAt",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Brevo live chat cookie recording the timestamp of the user's last page view."
  },
  {
    name: "BrevoConversations.referrer",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Brevo live chat cookie storing the referrer URL for conversation context."
  },
  {
    name: "browserupdateorg",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Browser Update notification cookie recording when the user was shown an update notification."
  },
  {
    name: "brz-firstVisit",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Brizy page builder cookie recording the timestamp of the visitor's first site visit."
  },
  {
    name: "brz-lastVisit",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Brizy page builder cookie recording the timestamp of the visitor's most recent visit."
  },
  {
    name: "brz-pagesViews",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Brizy page builder cookie counting the total number of pages viewed by the visitor."
  },
  {
    name: "brz-pagesViewsInSessionTimeLine",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Brizy page builder cookie tracking the page views timeline within the current session."
  },
  {
    name: "brz-sessions",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Brizy page builder cookie counting the total number of sessions for the visitor."
  },
  {
    name: "brz-showedPopupsInSessionTimeLine",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Brizy page builder cookie tracking which popups were shown during the current session."
  },
  {
    name: "bscookie",
    vendor: "LinkedIn Insight",
    category: "advertisement",
    wildcard: false,
    description: "Used by the social networking service, LinkedIn, for tracking the use of embedded services."
  },
  {
    name: "bSession",
    vendor: "Wix",
    category: "necessary",
    wildcard: false,
    description: "Used by Wix for system effectiveness measurement"
  },
  {
    name: "bugsnag-anonymous-id",
    vendor: "Bugsnag",
    category: "necessary",
    wildcard: false,
    description: "Used to assign an anonymous ID so website errors can be tracked and fixed more effectively."
  },
  {
    name: "burst_uid",
    vendor: "Burst Statistics",
    category: "analytics",
    wildcard: false,
    description: "Used by Burst Statistics to store and track interaction locally"
  },
  {
    name: "c",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Generic short-form cookie storing a session or tracking identifier."
  },
  {
    name: "ca-bookvisit-ibe",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "CA Technologies hotel Internet Booking Engine cookie for reservation session tracking."
  },
  {
    name: "cache-",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores cache-related data to optimize page load performance."
  },
  {
    name: "caf_ipaddr",
    vendor: "GoDaddy Domain Parking",
    category: "advertisement",
    wildcard: false,
    description: "Stores the visitor\u2019s IP address for geolocation and ad delivery purposes. Used to determine where the visitor is located and improve ad relevance."
  },
  {
    name: "campaign-timer",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores campaign timer data for time-sensitive marketing promotions."
  },
  {
    name: "campaign-track",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Tracks which marketing campaign directed the user to the site."
  },
  {
    name: "Cart",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores the contents of the shopping cart for the current user session."
  },
  {
    name: "cart_currency",
    vendor: "Shopify",
    category: "necessary",
    wildcard: false,
    description: "Used by Shopify to show the content of your cart in the right currency"
  },
  {
    name: "cart_sig",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by Shopify in connection with checkout."
  },
  {
    name: "cart_ts",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores the timestamp of when items were last added to the shopping cart."
  },
  {
    name: "cb_anonymous_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores an anonymous user identifier for Chargebee subscription analytics."
  },
  {
    name: "cb_group_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a group identifier for Chargebee subscription plan grouping."
  },
  {
    name: "cb_user_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user identifier for Chargebee subscription management."
  },
  {
    name: "cb-enabled",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records whether the cookie banner has been acknowledged by the user."
  },
  {
    name: "cee",
    vendor: "Stape (server-side tagging)",
    category: "analytics",
    wildcard: false,
    description: "Used by Stape (server-side Google Tag Manager provider) to connect browser events with server-side tracking. It helps attribute visits and advertising campaigns accurately by passing event data between the browser and Stape\u2019s server infrastructure."
  },
  {
    name: "cf_clearance",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Cloudflare cookie proving the browser passed a security challenge, granting site access."
  },
  {
    name: "cf:aff_sub",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ClickFunnels affiliate sub-ID cookie for affiliate commission tracking."
  },
  {
    name: "cf:aff_sub2",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ClickFunnels second affiliate sub-ID for granular affiliate tracking."
  },
  {
    name: "cf:aff_sub3",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ClickFunnels third affiliate sub-ID for detailed affiliate campaign tracking."
  },
  {
    name: "cf:affiliate_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ClickFunnels affiliate identifier cookie for commission attribution."
  },
  {
    name: "cf:cf_affiliate_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ClickFunnels confirmed affiliate identifier for verified commission tracking."
  },
  {
    name: "cf:content",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ClickFunnels content identifier cookie for tracking which funnel content was viewed."
  },
  {
    name: "cf:medium",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ClickFunnels medium cookie storing the marketing medium for traffic attribution."
  },
  {
    name: "cf:name",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ClickFunnels name cookie storing campaign name data for attribution."
  },
  {
    name: "cf:source",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ClickFunnels source cookie storing traffic source data for attribution."
  },
  {
    name: "cf:term",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ClickFunnels term cookie storing search term data for paid search attribution."
  },
  {
    name: "cf:visitor_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ClickFunnels visitor identifier cookie for tracking visitors through sales funnels."
  },
  {
    name: "CFID",
    vendor: "Adobe ColdFusion",
    category: "necessary",
    wildcard: false,
    description: "Used by Adobe ColdFusion applications to uniquely identify a client device (browser) to maintain session state."
  },
  {
    name: "CFTOKEN",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by Adobe ColdFusion applications to uniquely identify a client device (browser) to maintain session state."
  },
  {
    name: "cfz_google-analytics_v4",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "cfzs_google-analytics_v4",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "cg_uuid",
    vendor: "CHEQ",
    category: "necessary",
    wildcard: false,
    description: "Used by CHEQ AI Technologies to monitor the technical information and use of devices that connect to the website to protect it from malicious traffic."
  },
  {
    name: "chatbase_anon_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Chatbase AI chatbot cookie storing an anonymous visitor identifier for chat sessions."
  },
  {
    name: "chatyWidget_0",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Chaty chat widget cookie storing session state for the floating multi-channel chat button."
  },
  {
    name: "ci_session",
    vendor: "CodeIgniter",
    category: "necessary",
    wildcard: false,
    description: "This cookie is normally associated with the CodeIgniter framework for building PHP based applications. It is typically used to maintain a user state during a browser session for consistency of user experience. By default the cookie is destroyed when the browser session ends."
  },
  {
    name: "ci_sessions",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "CodeIgniter PHP framework session cookie for maintaining user session state."
  },
  {
    name: "cid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a client or campaign identifier for tracking user sessions and conversions."
  },
  {
    name: "city",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user's detected city for location-based content personalization."
  },
  {
    name: "cl.",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a short-form analytics or session identifier."
  },
  {
    name: "CLID",
    vendor: "Microsoft Clarity",
    category: "analytics",
    wildcard: false,
    description: "Identifies the first-time Clarity saw this user on any site using Clarity."
  },
  {
    name: "ClientId",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a unique client identifier for user tracking across sessions."
  },
  {
    name: "CloudFront-Key-Pair-Id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "AWS CloudFront signed cookie containing the key pair ID for accessing restricted content."
  },
  {
    name: "CloudFront-Policy",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "AWS CloudFront signed cookie containing the access policy for restricted content delivery."
  },
  {
    name: "CloudFront-Signature",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "AWS CloudFront signed cookie containing the HMAC-SHA1 signature for content access verification."
  },
  {
    name: "CM",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Identifies if there is a need to re-check partner\u2018s cookie matching existence (set by AdServing)"
  },
  {
    name: "CM14",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Identifies if there is a need to re-check partner\u2018s cookie matching existence."
  },
  {
    name: "CMID",
    vendor: "Casale Media",
    category: "advertisement",
    wildcard: false,
    description: "Cookie is set by Casale Media. The main business activity is linked to advertising and tracking the products users are looking at."
  },
  {
    name: "cmplz_consented_services",
    vendor: "Complianz",
    category: "necessary",
    wildcard: false,
    description: "Used to record and remember visitors\u2019 consent choices."
  },
  {
    name: "cmplz_cookie_data",
    vendor: "Complianz",
    category: "necessary",
    wildcard: false,
    description: "Used to record and remember visitors\u2019 consent choices."
  },
  {
    name: "cmplz_functional",
    vendor: "Complianz",
    category: "necessary",
    wildcard: false,
    description: "Used to record and remember visitors\u2019 consent choices."
  },
  {
    name: "cmplz_id",
    vendor: "Complianz",
    category: "necessary",
    wildcard: false,
    description: "Used to record and remember visitors\u2019 consent choices."
  },
  {
    name: "cmplz_marketing",
    vendor: "Complianz",
    category: "necessary",
    wildcard: false,
    description: "Used to record and remember visitors\u2019 consent choices."
  },
  {
    name: "cmplz_policy_id",
    vendor: "Complianz",
    category: "necessary",
    wildcard: false,
    description: "Used to record and remember visitors\u2019 consent choices."
  },
  {
    name: "cmplz_preferences",
    vendor: "Complianz",
    category: "necessary",
    wildcard: false,
    description: "Used to record and remember visitors\u2019 consent choices."
  },
  {
    name: "cmplz_saved_categories",
    vendor: "Complianz",
    category: "necessary",
    wildcard: false,
    description: "Used to record and remember visitors\u2019 consent choices."
  },
  {
    name: "cmplz_saved_services",
    vendor: "Complianz",
    category: "necessary",
    wildcard: false,
    description: "Used to record and remember visitors\u2019 consent choices."
  },
  {
    name: "cmplz_statistics",
    vendor: "Complianz",
    category: "necessary",
    wildcard: false,
    description: "Used to record and remember visitors\u2019 consent choices."
  },
  {
    name: "cmplz_user_data",
    vendor: "Complianz",
    category: "necessary",
    wildcard: false,
    description: "Used to record and remember visitors\u2019 consent choices."
  },
  {
    name: "CMPRO",
    vendor: "Casale Media",
    category: "advertisement",
    wildcard: false,
    description: "Cookie is set by Casale Media. The main business activity is linked to advertising and tracking the products users are looking at."
  },
  {
    name: "CMPS",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Cookie is set by Casale Media. The main business activity is linked to advertising and tracking the products users are looking at."
  },
  {
    name: "CMSPreferredCulture",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "CMSSESSID",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores CMS platform session identifier for user authentication."
  },
  {
    name: "cn_uc__",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Stores user consent data for CN-specific consent management."
  },
  {
    name: "cn-session-id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a session identifier for CN platform session management."
  },
  {
    name: "cn-sv-id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a server or visitor identifier for CN platform session tracking."
  },
  {
    name: "com.adobe.reactor.core.maxFrequency.",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Adobe Launch/Tags cookie storing maximum trigger frequency limits for tag rules."
  },
  {
    name: "com.adobe.reactor.dataElements.",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Adobe Launch/Tags cookie caching data element values for tag rule conditions."
  },
  {
    name: "COMPASS",
    vendor: "Google Docs",
    category: "other",
    wildcard: false,
    description: "Set by Google Docs to support document editing and collaboration features. This cookie helps ensure documents load correctly, changes are saved, and sharing works securely."
  },
  {
    name: "connect.sid",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "The cookie is necessary for secure log-in and the detection of any spam or abuse of the website."
  },
  {
    name: "CONSENT",
    vendor: "Google Ads",
    category: "performance",
    wildcard: false,
    description: "Used by Google to store user consent preferences"
  },
  {
    name: "cookie",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Generic test or placeholder cookie used to verify browser cookie functionality."
  },
  {
    name: "cookie_consent_level",
    vendor: "TermsFeed Privacy Consent",
    category: "necessary",
    wildcard: false,
    description: "Stores the visitor\u2019s cookie consent preferences. This ensures the website remembers which categories of cookies the visitor has accepted or declined."
  },
  {
    name: "cookie_lan",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user's selected language preference set via cookie consent interaction."
  },
  {
    name: "COOKIE_SUPPORT",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Tests and records whether the visitor's browser supports cookies."
  },
  {
    name: "CookieConsent",
    vendor: "Cookiebot",
    category: "necessary",
    wildcard: false,
    description: "Stores the user\u2019s cookie consent state for the current domain, ensuring that cookie preferences are remembered and applied on future visits."
  },
  {
    name: "cookieEnab",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records whether cookies are enabled in the user's browser."
  },
  {
    name: "cookiehub",
    vendor: "CookieHub",
    category: "necessary",
    wildcard: false,
    description: "Used by CookieHub to store information about whether visitors have given or declined the use of cookie categories used on the site."
  },
  {
    name: "cookiehub_",
    vendor: "Unknown",
    category: "necessary",
    wildcard: true,
    description: "Used by CookieHub to store information about whether visitors have given or declined the use of cookie categories used on the site."
  },
  {
    name: "cookiehub-ac",
    vendor: "CookieHub",
    category: "necessary",
    wildcard: false,
    description: "Used to store AC string (Google Additional Consent Mode) which contains a list of consented Google Ad Tech Providers that are not registered with IAB."
  },
  {
    name: "cookielawinfo-checkbox-",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "CookieYes plugin cookie storing user consent status for different cookie categories."
  },
  {
    name: "cookiepal-consent",
    vendor: "CookiePal",
    category: "necessary",
    wildcard: false,
    description: "Stores the user's cookie consent preferences."
  },
  {
    name: "CookiesActive",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores whether the user has confirmed cookie acceptance on the site."
  },
  {
    name: "CookieScriptConsent",
    vendor: "CookieScript",
    category: "necessary",
    wildcard: false,
    description: "Stores visitor cookie consent preferences so the consent banner remains accurate and consistent."
  },
  {
    name: "cookiesession1",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used to identify sessions of registered users on the web."
  },
  {
    name: "cookieyes-consent",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "CookieYes sets this cookie to remember users\u2019 consent preferences so that their preferences are respected on their subsequent visits to this site."
  },
  {
    name: "country",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Stores the user's detected country for geographic content and pricing customization."
  },
  {
    name: "CRAFT_CSRF_TOKEN",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "This cookie will be created to facilitate protection against cross-site request forgeries. This helps to safeguard data as it is submitted through forms on the website."
  },
  {
    name: "CraftSessionId",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Craft relies on PHP sessions to maintain sessions across web requests. That is done via this PHP session cookie."
  },
  {
    name: "crisp-client",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Crisp live chat cookie storing the visitor identifier and chat session data."
  },
  {
    name: "criteo",
    vendor: "Criteo",
    category: "advertisement",
    wildcard: false,
    description: "Presents the user with relevant content and advertisement. The service is provided by third-party advertisement hubs, which facilitate real-time bidding for advertisers."
  },
  {
    name: "crumb",
    vendor: "Squarespace",
    category: "necessary",
    wildcard: false,
    description: "Used by Squarespace to prevent cross-site request forgery (CSRF)."
  },
  {
    name: "csrf_token",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by many systems for Cross Site Request Forgery protection."
  },
  {
    name: "csrftoken",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by many systems for Cross Site Request Forgery protection."
  },
  {
    name: "cSyncDp",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores cookie synchronization data for cross-domain tracking consistency."
  },
  {
    name: "ct_checked_emails",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Stores information about email addresses entered in forms to detect spam submissions."
  },
  {
    name: "ct_checked_emails_exist",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Stores information about email addresses entered in forms to detect spam submissions."
  },
  {
    name: "ct_checkjs",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Confirms whether JavaScript is enabled in the visitor\u2019s browser to distinguish humans from bots."
  },
  {
    name: "ct_cookies_type",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the types of cookies accepted by the user for consent management."
  },
  {
    name: "ct_fkp_timestamp",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Records the time of the first key press in a form field to verify human input."
  },
  {
    name: "ct_mouse_moved",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Tracks mouse movement on the page to confirm human interaction."
  },
  {
    name: "ct_pointer_data",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Stores details of mouse pointer activity (such as coordinates) to validate genuine users."
  },
  {
    name: "ct_ps_timestamp",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Records the timestamp of the last user interaction in a form."
  },
  {
    name: "ct_screen_info",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Stores basic screen and browser details (like screen size) for anti-spam checks."
  },
  {
    name: "ct_timezone",
    vendor: "CleanTalk Anti-Spam &amp; Security",
    category: "necessary",
    wildcard: false,
    description: "Saves the visitor\u2019s time zone to help identify suspicious or automated submissions."
  },
  {
    name: "cto_bundle",
    vendor: "Criteo",
    category: "advertisement",
    wildcard: false,
    description: "Presents the user with relevant content and advertisement. The service is provided by third-party advertisement hubs, which facilitate real-time bidding for advertisers."
  },
  {
    name: "culture",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user's culture setting (language and region) for CMS localization."
  },
  {
    name: "currency",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "General cookie most frequently used to store currency selection"
  },
  {
    name: "cusid",
    vendor: "ClickDimensions",
    category: "advertisement",
    wildcard: false,
    description: "Stores a session identifier. Identifies a single browsing session on the site to distinguish multiple visits from the same user."
  },
  {
    name: "custom-filter-uid-",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores a unique identifier for custom filter settings in product search."
  },
  {
    name: "cuvon",
    vendor: "ClickDimensions",
    category: "advertisement",
    wildcard: false,
    description: "Indicates when the user last visited the site. Helps determine whether to continue tracking within the same session or create a new session."
  },
  {
    name: "cz_s_l_secure_code",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a secure verification code for CZ locale site security."
  },
  {
    name: "data-c",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores encoded tracking or configuration data for analytics purposes."
  },
  {
    name: "data-c-ts",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a timestamp associated with encoded tracking data."
  },
  {
    name: "data-timeout",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a timeout value for data loading or tracking event triggers."
  },
  {
    name: "db_latest_version_",
    vendor: "Unknown",
    category: "necessary",
    wildcard: true,
    description: "Stores the latest database version identifier for client-side cache invalidation."
  },
  {
    name: "debug",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores debug mode state, typically set by developers during testing and troubleshooting."
  },
  {
    name: "demdex",
    vendor: "Adobe Audience Manager",
    category: "advertisement",
    wildcard: false,
    description: "Audience Manager sets this cookie to assign a unique ID to a site visitor. The demdex cookie helps Audience Manger perform basic functions such as visitor identification, ID synchronization, segmentation, modeling, reporting, etc."
  },
  {
    name: "DEVICE_INFO",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "This cookie is set by YouTube video service on pages with YouTube embedded videos"
  },
  {
    name: "device_view",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "This cookie is used to determine which type of device the visitor is using, so the website can be properly formatted."
  },
  {
    name: "df-random-userid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a randomly generated user ID for anonymous analytics tracking."
  },
  {
    name: "df-session",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores session data for the df (digital framework) analytics or personalization layer."
  },
  {
    name: "dicbo_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a unique visitor identifier for DICbO audience data platform tracking."
  },
  {
    name: "DID",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by the Auth0 Authentication SSO system to identify the device you are using. This helps improve security and protect against suspicious activity."
  },
  {
    name: "did_compat",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Fallback cookie used by the Auth0 Authentication SSO system for device identification and attack protection on browsers that don\u2019t support newer cookie settings."
  },
  {
    name: "django_language",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Remembers your language choice so the site is shown in your preferred language."
  },
  {
    name: "dm_last_page_view",
    vendor: "Duda Smart Sites",
    category: "analytics",
    wildcard: false,
    description: "Records the time when the visitor last viewed a page on the site. Used to measure browsing activity and improve personalization."
  },
  {
    name: "dm_last_visit",
    vendor: "Duda Smart Sites",
    category: "analytics",
    wildcard: false,
    description: "Stores the date and time of the visitor\u2019s last visit to the website. Helps the site recognize returning visitors."
  },
  {
    name: "dm_this_page_view",
    vendor: "Duda Smart Sites",
    category: "analytics",
    wildcard: false,
    description: "Tracks the number of times a visitor has viewed the current page during their session. Helps personalize or adapt content for the visitor."
  },
  {
    name: "dm_timezone_offset",
    vendor: "Duda Smart Sites",
    category: "analytics",
    wildcard: false,
    description: "Stores the visitor\u2019s local timezone offset so that times and dates can be displayed correctly."
  },
  {
    name: "dm_total_visits",
    vendor: "Duda Smart Sites",
    category: "analytics",
    wildcard: false,
    description: "Counts how many times a visitor has returned to the site. Used to distinguish new vs. returning visitors and adjust site content accordingly."
  },
  {
    name: "dmSessionID",
    vendor: "Dotdigital",
    category: "advertisement",
    wildcard: false,
    description: "Tracks and identifies a visitor as a Dotdigital contact whilst they browse a site\u2019s pages. This data can then be used for better segmenting and targeting of contacts."
  },
  {
    name: "dpm",
    vendor: "Adobe Audience Manager",
    category: "advertisement",
    wildcard: false,
    description: "Adobe Audience Manager - data management platform uses this cookie to record information around synchronization of IDs."
  },
  {
    name: "dps_site_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the Digital Publishing Suite site identifier for content analytics."
  },
  {
    name: "drift_aid",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Used by Drift to provide Website Chat functionality."
  },
  {
    name: "drift_campaign_refresh",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Used by Drift to provide Website Chat functionality."
  },
  {
    name: "driftt_aid",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "This is the anonymous identifier token. It is used to tie the visitor on your website with the profile within the Drift system."
  },
  {
    name: "DSID",
    vendor: "Google Ads",
    category: "advertisement",
    wildcard: false,
    description: "Used by Google Ads to identify a signed-in user on non-Google sites and to remember whether the user has agreed to ad personalization."
  },
  {
    name: "dtCookie",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by Dynatrace to track a visit across multiple requests"
  },
  {
    name: "dv0qai26lg6v2y6kl7yyc36brext",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a randomly generated session or tracking identifier."
  },
  {
    name: "ea11y-global-state",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "UserWay accessibility widget cookie storing global accessibility preferences."
  },
  {
    name: "ea11y-session-state",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "UserWay accessibility widget cookie storing session-specific accessibility settings."
  },
  {
    name: "electron_cpv_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Electron app cookie storing a content policy version for web-based Electron applications."
  },
  {
    name: "elementor",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used in context with the website's WordPress theme. The cookie allows the website owner to implement or change the website's content in real-time."
  },
  {
    name: "elfsight_viewed_recently",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "This cookie is used to track recently viewed content on the elfsight.com platform."
  },
  {
    name: "ELOQUA",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Set by Eloqua to track individual visitors and their use of the site. It is set when you first visit the site and updated on subsequent visits."
  },
  {
    name: "email",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user's email address for pre-filling forms or remembering login credentials."
  },
  {
    name: "enforce_policy",
    vendor: "Paypal",
    category: "necessary",
    wildcard: false,
    description: "This cookie is provided by PayPal. The cookie is necessary for making a safe transaction through PayPal."
  },
  {
    name: "eng_mt",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores an engagement metrics timestamp for user interaction analytics."
  },
  {
    name: "ep201",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores an event or experiment parameter identifier for analytics tracking."
  },
  {
    name: "euconsent-v2",
    vendor: "CookieHub",
    category: "necessary",
    wildcard: false,
    description: "Used by CookieHub and other consent management platforms to store the IAB TCF consent string and consent information for all standard IAB vendors and purposes."
  },
  {
    name: "eventQueue",
    vendor: "Apollo.io",
    category: "advertisement",
    wildcard: false,
    description: "Stores queued tracking events about user interactions on the site to ensure they are sent reliably to Apollo.io\u2019s servers, supporting lead analytics and sales insights even if connectivity is temporarily lost."
  },
  {
    name: "everest_g_v2",
    vendor: "Adobe Advertising Cloud",
    category: "advertisement",
    wildcard: false,
    description: "Adobe (former Everest Technologies) tracking cookie. This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website."
  },
  {
    name: "eviivo_lang",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Eviivo hospitality management cookie storing the user's language preference."
  },
  {
    name: "EXP_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Stores A/B test experiment assignment data for the current visitor."
  },
  {
    name: "expiry_partner",
    vendor: "GoDaddy Domain Parking",
    category: "advertisement",
    wildcard: false,
    description: "Tracks the advertising partner associated with the parked domain, used for reporting and billing purposes."
  },
  {
    name: "fbssls_",
    vendor: "Facebook Login",
    category: "necessary",
    wildcard: true,
    description: "Temporary session storage entry created by Facebook Login. It stores secure login session details to allow single sign-on and protect against fraudulent login attempts. The entry is removed automatically when the browser session ends."
  },
  {
    name: "fc_clicked_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Records which calls-to-action or feature components were clicked by the user."
  },
  {
    name: "fcsid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a first-click session identifier for attribution tracking."
  },
  {
    name: "fe_typo_user",
    vendor: "TYPO3",
    category: "necessary",
    wildcard: false,
    description: "This cookie is a standard session cookie from Typo3 CMS."
  },
  {
    name: "fedops.logger.defaultOverrides",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used for stability/effectiveness measurement"
  },
  {
    name: "fedops.logger.sessionId",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the Wix platform to log session stability, performance errors, and technical metrics for system monitoring."
  },
  {
    name: "feefoUserId",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Feefo reviews platform cookie storing a user identifier for review request tracking."
  },
  {
    name: "feh--",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a feature enablement hash for conditional feature display logic."
  },
  {
    name: "find_dynamic_form_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Stores dynamic form configuration or state data for multi-step forms."
  },
  {
    name: "firebase:host:",
    vendor: "Firebase",
    category: "other",
    wildcard: false,
    description: "Firebase cookie storing host configuration data for Firebase Realtime Database connections."
  },
  {
    name: "first_session",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records whether this is the user's first visit session on the site."
  },
  {
    name: "flaretrk",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Flare tracking cookie for monitoring content engagement and referral performance."
  },
  {
    name: "FluentLocale",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user's locale preference for the Fluent CMS localization system."
  },
  {
    name: "form_key",
    vendor: "Magento",
    category: "performance",
    wildcard: false,
    description: "A security measure that appends a random string to all form submissions to protect the data from Cross-Site Request Forgery (CSRF).  Used by Magento."
  },
  {
    name: "formstack.analytics.viewed-form.",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Formstack cookie tracking which forms the visitor has viewed for analytics."
  },
  {
    name: "fp_ccid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "FingerprintJS cookie storing a visitor ID for browser fingerprinting-based identification."
  },
  {
    name: "fp_sid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "FingerprintJS session cookie for browser fingerprinting session tracking."
  },
  {
    name: "FPAU",
    vendor: "Google Ads",
    category: "advertisement",
    wildcard: false,
    description: "Used by Campaign Manager, Display & Video 360, Google Ads and Search Ads 360 to store user interaction and attribution data for ad performance measurement."
  },
  {
    name: "FPGSID",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: false,
    description: "Stores a session or user identifier to track how visitors interact with a website. This helps Google Analytics measure website performance, user engagement, and usage patterns."
  },
  {
    name: "FPID",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: false,
    description: "This cookie is used for storing the Client ID in the request to Google\u2019s servers."
  },
  {
    name: "FPLC",
    vendor: "Google Analytics",
    category: "analytics",
    wildcard: false,
    description: "Links user identity across domains to support analytics attribution and marketing tracking."
  },
  {
    name: "fr",
    vendor: "Meta Pixel",
    category: "advertisement",
    wildcard: false,
    description: "Used by Facebook to deliver a series of advertisement products such as real time bidding from third party advertisers."
  },
  {
    name: "frontend",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by Magento to store a unique session ID to maintain state"
  },
  {
    name: "frontend_lang",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Odoo ERP cookie storing the user's selected frontend language preference."
  },
  {
    name: "fs_lua",
    vendor: "FullStory",
    category: "analytics",
    wildcard: false,
    description: "Captures the timestamp of the last user action to manage session lifecycle."
  },
  {
    name: "fs_uid",
    vendor: "FullStory",
    category: "analytics",
    wildcard: false,
    description: "Stores a unique visitor ID to link multiple sessions and page views for experience analytics. Required for session replay to work."
  },
  {
    name: "G",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Generic short-form cookie storing a tracking or session identifier."
  },
  {
    name: "G_ENABLED_IDPS",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "The cookie is used by Google and is used for Google Single Sign On."
  },
  {
    name: "g2tracking",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "G2 review platform tracking cookie for monitoring user interactions on G2 listings."
  },
  {
    name: "gatsby-plugin-cookiehub-banner-analytics-allowed",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "This cookie is used in Gatsby plugin to use cookie banner generated with cookiehub."
  },
  {
    name: "gatsby-plugin-cookiehub-banner-marketing-allowed",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "This cookie is used in Gatsby plugin to use cookie banner generated with cookiehub."
  },
  {
    name: "gatsby-plugin-cookiehub-banner-necessary-allowed",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "This cookie is used in Gatsby plugin to use cookie banner generated with cookiehub."
  },
  {
    name: "gatsby-plugin-cookiehub-banner-preferences-allowed",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "This cookie is used in Gatsby plugin to use cookie banner generated with cookiehub."
  },
  {
    name: "gatsby-plugin-cookiehub-banner-uncategorized-allowed",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "This cookie is used in Gatsby plugin to use cookie banner generated with cookiehub."
  },
  {
    name: "gatsby-plugin-google-analytics-gdpr_cookies-enabled",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "This cookie is used in Gatsby plugin to add google analytics GDPR compliant."
  },
  {
    name: "gaVisitorUuid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a UUID for identifying visitors in Google Analytics-related tracking."
  },
  {
    name: "gckp",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a tracking key for user identification in analytics or marketing platforms."
  },
  {
    name: "GCLB",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "The &quot;GCLB&quot; cookie is set by the Google Cloud Platform service to optimize performance of the website."
  },
  {
    name: "gigs_sid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Gigs platform session identifier cookie for managing user sessions."
  },
  {
    name: "gigsCheckout",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Gigs e-commerce cookie storing checkout state during the purchase flow."
  },
  {
    name: "gigsSignInData",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Gigs cookie storing sign-in data during the checkout authentication flow."
  },
  {
    name: "giosg_chat_id_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "globalRibbonVisible-",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores the visibility state of a global ribbon or notification bar for the user."
  },
  {
    name: "Google Analytics",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Google Analytics cookie storing tracking data for site traffic and behavior analysis."
  },
  {
    name: "google_adsense_settings",
    vendor: "Google AdSense",
    category: "advertisement",
    wildcard: false,
    description: "Used by Google AdSense to store settings"
  },
  {
    name: "google_auto_fc_cmp_setting",
    vendor: "Google AdSense",
    category: "necessary",
    wildcard: false,
    description: "Used by Google AdSense to store the user's cookie consent state"
  },
  {
    name: "google-analytics_v4_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Stores Google Analytics 4 measurement data for site traffic analysis."
  },
  {
    name: "googtrans",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Remembers the language you chose with Google Translate so the site stays translated as you browse."
  },
  {
    name: "gp_e",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores experiment data for Google or third-party product testing."
  },
  {
    name: "gp_s",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores session data for Google or third-party product analytics."
  },
  {
    name: "gt_autoswitch",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Google Translate cookie recording whether auto-detection and language switching is enabled."
  },
  {
    name: "gtmBrowserId",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Google Tag Manager cookie storing a browser identifier for tag management."
  },
  {
    name: "guest",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a token or identifier for anonymous guest user sessions."
  },
  {
    name: "guest_id",
    vendor: "Twitter / X",
    category: "advertisement",
    wildcard: false,
    description: "Cookies set by Twitter/X to identify visitors, deliver embedded content, and measure or personalize advertising campaigns."
  },
  {
    name: "guest_id_ads",
    vendor: "Twitter / X",
    category: "advertisement",
    wildcard: false,
    description: "Cookies set by Twitter/X to identify visitors, deliver embedded content, and measure or personalize advertising campaigns."
  },
  {
    name: "guest_id_marketing",
    vendor: "Twitter / X",
    category: "advertisement",
    wildcard: false,
    description: "Cookies set by Twitter/X to identify visitors, deliver embedded content, and measure or personalize advertising campaigns."
  },
  {
    name: "GUEST_LANGUAGE_ID",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "This cookie is generated by the Liferay, its\xA0function is to store the language preferences."
  },
  {
    name: "guid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a globally unique identifier for user identification across sessions."
  },
  {
    name: "HAPLB8G",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "HAProxy or Varnish load balancer cookie for server affinity routing."
  },
  {
    name: "has_js",
    vendor: "Drupal",
    category: "necessary",
    wildcard: false,
    description: "Most commonly associated with the Drupal content management system. Drupal uses this cookie to indicate whether or not the visitors browser has JavaScript enabled."
  },
  {
    name: "hash_irish_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Stores a hashed identifier used in Irish-locale tracking configurations."
  },
  {
    name: "HASSESSION",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a session flag indicating the user has an active authenticated session."
  },
  {
    name: "hello_retail_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Hello Retail e-commerce personalization cookie storing a unique visitor identifier."
  },
  {
    name: "helpcrunch.com-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "HelpCrunch live chat cookie storing visitor session data for chat continuity."
  },
  {
    name: "hidecta",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores whether the user has dismissed a call-to-action prompt."
  },
  {
    name: "History.store",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores browsing history data for navigation features within the site."
  },
  {
    name: "hjActiveViewportIds",
    vendor: "Hotjar",
    category: "analytics",
    wildcard: false,
    description: "User by Hotjar to store user active viewports IDs and an expirationTimestamp that is used to validate active viewports on script initialization."
  },
  {
    name: "hjViewportId",
    vendor: "Hotjar",
    category: "analytics",
    wildcard: false,
    description: "This Hotjar cookie stores information about the user viewport such as size and dimensions."
  },
  {
    name: "hl",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the host language preference for Google services or similar platforms."
  },
  {
    name: "hmt_id",
    vendor: "hCaptcha",
    category: "necessary",
    wildcard: false,
    description: "Stores a unique identifier to distinguish visitors for bot detection. Supports fraud prevention by identifying suspicious or automated behavior and reducing abuse on the website."
  },
  {
    name: "hs",
    vendor: "Wix",
    category: "necessary",
    wildcard: false,
    description: "Set by Wix and used for security reasons"
  },
  {
    name: "HstCfa",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "HubSpot cookie storing the first page a visitor viewed for attribution tracking."
  },
  {
    name: "HstCla",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "HubSpot cookie storing the last page a visitor viewed before converting."
  },
  {
    name: "HstCmu",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "HubSpot cookie storing the most-visited page by the visitor for lead scoring."
  },
  {
    name: "HstCns",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "HubSpot cookie storing the number of sessions the visitor has had."
  },
  {
    name: "HstCnv",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "HubSpot cookie recording whether the visitor has converted by submitting a form."
  },
  {
    name: "HstPn",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "HubSpot cookie storing the page number in the visitor's journey sequence."
  },
  {
    name: "HstPt",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "HubSpot cookie storing the page type visited for CRM segmentation."
  },
  {
    name: "htmove_has_count-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a move event count for heatmap or scroll tracking analytics."
  },
  {
    name: "hubspotutk",
    vendor: "HubSpot",
    category: "analytics",
    wildcard: false,
    description: "This cookie name is associated with websites built on the HubSpot platform. This cookie is used to keep track of a visitor's identity. This cookie is passed to HubSpot on form submission and used when deduplicating contacts."
  },
  {
    name: "i",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Generic short-form identifier cookie for session or user tracking."
  },
  {
    name: "i18n_redirected",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Used by the nuxt-i18n package which attempts to redirect users to their preferred language by detecting their browser's language."
  },
  {
    name: "i18next",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Stores the user's language preference for the i18next internationalization framework."
  },
  {
    name: "i18nextLng",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Used to store the language preference of the user"
  },
  {
    name: "iconify-count",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Iconify icon library cookie storing the count of icons loaded for caching."
  },
  {
    name: "iconify-version",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Iconify icon library cookie storing the version hash for cache invalidation."
  },
  {
    name: "iconify0",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Iconify icon library cookie storing bundled icon data for client-side caching."
  },
  {
    name: "id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "IDE",
    vendor: "Google Ads",
    category: "advertisement",
    wildcard: false,
    description: "Used by Google's DoubleClick to serve targeted advertisements that are relevant to users across the web. Targeted advertisements may be displayed to users based on previous visits to a website. These cookies measure the conversion rate of ads presented to the user."
  },
  {
    name: "images",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores image loading preferences or cached image data identifiers."
  },
  {
    name: "incap_ses_",
    vendor: "Unknown",
    category: "necessary",
    wildcard: true,
    description: "Incapsula DDoS Protectiona and Web Application Firewall: cookie for linking HTTP requests to a certain session (AKA visit). Re-opening the browser and accessing same site are registered as different visits. In order to maintain existing sessions (ie, session cookie)"
  },
  {
    name: "INGRESSCOOKIE",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Cookie is used for load balancing purposes and session stickiness. This anonymous and technical session identifier is required for some website features."
  },
  {
    name: "instap-spid.",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Instapage cookie storing a session page identifier for conversion tracking."
  },
  {
    name: "instap-spses.",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Instapage cookie storing session data for landing page performance analytics."
  },
  {
    name: "instapage-visit-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Instapage landing page cookie tracking visit data for conversion optimization."
  },
  {
    name: "intercom-device-id-",
    vendor: "Intercom",
    category: "performance",
    wildcard: false,
    description: "Used by Intercom Messenger to store identifier for each unique device that interacts with the Messenger. Intercom uses this cookie to determine the unique devices interacting with the Intercom Messenger to prevent abuse."
  },
  {
    name: "intercom-id-",
    vendor: "Intercom",
    category: "performance",
    wildcard: false,
    description: "Used by Intercom Messenger to store anonymous visitor identifier cookie."
  },
  {
    name: "intercom-session-",
    vendor: "Intercom",
    category: "performance",
    wildcard: false,
    description: "Used by Intercom Messenger to store identifier for each unique browser session and is used to keep track of sessions."
  },
  {
    name: "intercom.intercom-state-",
    vendor: "Intercom",
    category: "performance",
    wildcard: false,
    description: "Used by Intercom live chat function to recognise a visitor, in order to optimise the live chat functionality."
  },
  {
    name: "internalTrackingId",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores an internal tracking identifier for user journey analytics."
  },
  {
    name: "ip_group",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the IP address group classification for geo-targeting or access control."
  },
  {
    name: "ip2location_redirection_first_visit",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "IP2Location plugin cookie tracking whether the user has been redirected based on their IP location."
  },
  {
    name: "is_eu",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores whether the visitor is located in the European Union for GDPR compliance checks."
  },
  {
    name: "is_gdpr",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records whether GDPR applies to the current visitor based on their geographic location."
  },
  {
    name: "is_gdpr_b",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Binary flag cookie storing GDPR applicability status for the current visitor."
  },
  {
    name: "is_mobile",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used to know if you are using a mobile device"
  },
  {
    name: "is_unique",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records whether this is a unique first-time visit for deduplication in analytics."
  },
  {
    name: "is_visitor_unique",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records whether the visitor is unique within the analytics tracking period."
  },
  {
    name: "isMobileDevice",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores device type detection result (mobile vs. desktop) for responsive features."
  },
  {
    name: "ITEM_DETAILS_HYDRATION_ASSET_",
    vendor: "Unknown",
    category: "necessary",
    wildcard: true,
    description: "Stores server-rendered item detail data for client-side hydration in SPAs."
  },
  {
    name: "iutk",
    vendor: "Issuu",
    category: "analytics",
    wildcard: false,
    description: "The Issuu\u2019s analytics system uses cookies, log file data and embedded code to gather information regarding visitor activity on Issuu products. Issuu uses this information to help improve the services it provides to its users."
  },
  {
    name: "jboard_tenant_session",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "JobBoard platform session cookie for managing tenant-specific user sessions."
  },
  {
    name: "joinchat_views",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "JoinChat plugin cookie counting how many times the WhatsApp chat button was viewed."
  },
  {
    name: "JSESSIONID",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "General purpose platform session cookie, used by sites with JavaServer Pages (JSP). The cookie is usually used to maintain an anonymous user session by the server."
  },
  {
    name: "jv_",
    vendor: "Unknown",
    category: "necessary",
    wildcard: true,
    description: "JivoChat live chat cookie storing visitor session and chat history data."
  },
  {
    name: "keep_alive",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used in connection with buyer localization"
  },
  {
    name: "KHcl0EuY7AKSMgfvHl7J5E7hPtK",
    vendor: "Paypal",
    category: "necessary",
    wildcard: false,
    description: "This cookie are used to show banners from PayPal and run the purchase facilities offered on the site through PayPal."
  },
  {
    name: "kl-post-identification-sync",
    vendor: "Klaviyo",
    category: "advertisement",
    wildcard: false,
    description: "Used to sync profile identification for Klaviyo email and automation."
  },
  {
    name: "klaviyoOnsite",
    vendor: "Klaviyo",
    category: "advertisement",
    wildcard: false,
    description: "Tracks visitor behavior and form activity to support personalized marketing and automation."
  },
  {
    name: "klaviyoPagesVisitCount",
    vendor: "Klaviyo",
    category: "advertisement",
    wildcard: false,
    description: "Tracks number of pages viewed to trigger behavior-based forms and marketing actions."
  },
  {
    name: "klaviyoPagesVisitCountV2",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Klaviyo email marketing cookie counting page visits for behavioral segmentation."
  },
  {
    name: "klv_user_klevu-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Klevu AI search cookie storing a user identifier for personalized search results."
  },
  {
    name: "KRTBCOOKIE_",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: true,
    description: "Registers a unique ID that identifies the user's device during return visits across websites that use the same ad network. The ID is used to allow targeted ads."
  },
  {
    name: "l7_az",
    vendor: "Paypal",
    category: "necessary",
    wildcard: false,
    description: "Used in the PayPal payment function for login."
  },
  {
    name: "lan",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user's language preference for multilingual site navigation."
  },
  {
    name: "lander_type",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records the type of landing page a visitor arrived on for campaign analysis."
  },
  {
    name: "lang",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Session-based cookie that remembers the user's selected language version of a website."
  },
  {
    name: "language",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "This cookie keeps track of the chosen language. It is automatically removed when you turn off your web browser."
  },
  {
    name: "laravel_session",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Uses internally by Laravel to identify a session instance for a user."
  },
  {
    name: "LaSID",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "LiveAgent chat session identifier cookie for managing customer support sessions."
  },
  {
    name: "last_pys_landing_page",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by PixelYourSite to track the last landing page"
  },
  {
    name: "last_pysTrafficSource",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by PixelYourSite to track the last traffic source."
  },
  {
    name: "last_visited_store",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records the last store the user visited for store preference persistence."
  },
  {
    name: "lastExternalReferrer",
    vendor: "Meta Pixel",
    category: "advertisement",
    wildcard: false,
    description: "Detects how the user reached the website by registering their last URL-address."
  },
  {
    name: "lastExternalReferrerTime",
    vendor: "Meta Pixel",
    category: "advertisement",
    wildcard: false,
    description: "Used by Meta Pixel to record when a visitor last arrived from another site (such as Facebook, Instagram, or elsewhere) for advertising and attribution purposes."
  },
  {
    name: "lastsearchpage",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the last search results page visited for navigation and pagination state."
  },
  {
    name: "LaVisitorNew",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "LiveAgent cookie recording whether the visitor is new to the site."
  },
  {
    name: "lbx_ac_easystorage",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores accessible storage preferences for lightbox or widget sessions."
  },
  {
    name: "ld_env",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "LaunchDarkly feature flag cookie storing the environment context for flag evaluation."
  },
  {
    name: "ld_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "LaunchDarkly cookie storing the user identifier for feature flag targeting."
  },
  {
    name: "ld_session_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "LaunchDarkly cookie storing a session identifier for feature flag analytics."
  },
  {
    name: "ld_session_origin",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "LaunchDarkly cookie storing the session origin for feature flag targeting."
  },
  {
    name: "ld:",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "LaunchDarkly feature flag cookie storing flag state and user context data."
  },
  {
    name: "leadform_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Stores lead form interaction data for conversion tracking and optimization."
  },
  {
    name: "leady_session_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Leady lead tracking cookie storing a session identifier for B2B visitor identification."
  },
  {
    name: "LFR_SESSION_STATE_",
    vendor: "Unknown",
    category: "necessary",
    wildcard: true,
    description: "This is a general purpose identifier used to maintain user session variables. It is normally a random generated number, how it is used can be specific to the site, but a good example is maintaining a logged-in status for a user between pages."
  },
  {
    name: "lhnContact",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "LiveHelpNow live chat cookie storing contact information for ongoing support sessions."
  },
  {
    name: "lhnJWT",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "LiveHelpNow JWT token cookie for authenticating live chat sessions."
  },
  {
    name: "lhnRefresh",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "LiveHelpNow cookie storing a refresh token for live chat session persistence."
  },
  {
    name: "lhnStorageType",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "LiveHelpNow cookie storing the preferred storage type for chat session data."
  },
  {
    name: "li_alerts",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "LinkedIn cookie storing alert preferences and notification settings."
  },
  {
    name: "li_gc",
    vendor: "LinkedIn Insight",
    category: "performance",
    wildcard: false,
    description: "Stores user consent preferences for LinkedIn cookies to comply with privacy regulations."
  },
  {
    name: "li_sugr",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Used by LinkedIn to make a probabilistic match of a user's identity outside the Designated Countries"
  },
  {
    name: "lidc",
    vendor: "LinkedIn Insight",
    category: "performance",
    wildcard: false,
    description: "Maintains session routing for reliable LinkedIn service performance."
  },
  {
    name: "like-status-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the like status of a post or content item for the current user."
  },
  {
    name: "like-timestamp-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the timestamp when a piece of content was liked by the user."
  },
  {
    name: "litespeed_docref",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by Litespeed to store referrer data to manage caching and deliver optimized site content."
  },
  {
    name: "ln_or",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by LinkedIn to determine if Oribi analytics can be carried out on a specific domain"
  },
  {
    name: "loc",
    vendor: "AddThis",
    category: "analytics",
    wildcard: false,
    description: "This cookie is one of the cookies used to track usage of the Addthis.com service. It is set to store location data."
  },
  {
    name: "locale",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user's locale setting (language and region) for content localization."
  },
  {
    name: "localization",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "This cookie is used to store an interface language."
  },
  {
    name: "localProductSearch_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Stores local product search results cache for faster repeat searches."
  },
  {
    name: "loglevel",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores the JavaScript logging level setting (debug, info, warn) for developer tools."
  },
  {
    name: "loom_anon_comment",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by Loom to track comments on videos"
  },
  {
    name: "loom_referral_video",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by Loom to track referral paths of videos"
  },
  {
    name: "lpv",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a landing page view identifier for attribution and conversion tracking."
  },
  {
    name: "LS_CSRF_TOKEN",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "This is a Zoho Cookie. It is used for security purposes in order to avoid Cross-Site Request Forgery, (CSRF) for the AJAX calls made by the visitor. It expires once the browsing session ends."
  },
  {
    name: "ls_sid_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "LiveSession recording cookie storing the session identifier for session replay."
  },
  {
    name: "luigis.",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Luigi's Box search analytics cookie tracking user search behavior on e-commerce sites."
  },
  {
    name: "luigisbox_enabled",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Luigi's Box cookie storing whether the search widget is enabled for the user."
  },
  {
    name: "lz_ph",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "PostHog analytics session cookie storing session data for product analytics tracking."
  },
  {
    name: "m",
    vendor: "Stripe",
    category: "necessary",
    wildcard: false,
    description: "Used by Stripe Payment Services for fraud prevention and detection."
  },
  {
    name: "mage-cache-sessid",
    vendor: "Magento",
    category: "performance",
    wildcard: false,
    description: "The value of this cookie triggers the cleanup of local cache storage. Used by Magento."
  },
  {
    name: "mage-cache-storage",
    vendor: "Magento",
    category: "performance",
    wildcard: false,
    description: "Local storage of visitor-specific content that enables ecommerce functions. Used by Magento."
  },
  {
    name: "mage-cache-storage-section-invalidation",
    vendor: "Magento",
    category: "performance",
    wildcard: false,
    description: "Forces local storage of specific content sections that should be invalidated.  Used by Magento."
  },
  {
    name: "mage-cache-timeout",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by Magento to control cache expiration. This cookie ensures that website content such as products and cart data is refreshed at the right time so visitors always see updated information."
  },
  {
    name: "mage-customer-login",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Magento cookie indicating whether the current visitor is a logged-in customer."
  },
  {
    name: "mage-messages",
    vendor: "Magento",
    category: "performance",
    wildcard: false,
    description: "This cookie tracks error messages and other notifications that are shown to the user, such as the cookie consent message, and various error messages. Used by Magento."
  },
  {
    name: "mailchimp_landing_site",
    vendor: "Mailchimp",
    category: "analytics",
    wildcard: false,
    description: "Used by MailChimp landing pages to track the aggregate number of visitors and link clicks."
  },
  {
    name: "mapbox.eventData:",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Mapbox GL JS cookie storing event telemetry data for map interaction analytics."
  },
  {
    name: "mapbox.eventData.uuid:",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Mapbox GL JS cookie storing a UUID for map usage telemetry tracking."
  },
  {
    name: "marketing-enabled",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores whether the user has consented to marketing-related data collection."
  },
  {
    name: "matchadform",
    vendor: "Adform",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is used to target advertising that is appropriate for users online using Adform. The cookie can be used to collect the following information: Cookie ID, Mobile Advertising ID, Partner ID, browser and device information, IP address and analytical information about the functionality of advertising."
  },
  {
    name: "matrix_talent_pooling_system_session",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores session data for the Matrix talent pooling HR system."
  },
  {
    name: "mautic_device_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Mautic marketing automation cookie storing a device identifier for contact tracking."
  },
  {
    name: "mc",
    vendor: "Quantserve",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is set by Quantserve to track anonymous information about visitor behaviour on the website."
  },
  {
    name: "MC1",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Set by Microsoft Office 365 services to store a unique identifier for telemetry and diagnostics. This cookie is used by Microsoft\u2019s OneCollector system to track performance, reliability, and usage of embedded apps such as Outlook Calendar and Bookings."
  },
  {
    name: "messagesUtk",
    vendor: "Chatflows",
    category: "performance",
    wildcard: false,
    description: "This cookie is used to recognize visitors who chat with you via the\xA0chatflows tool. If the visitor leaves your site before they're added as a contact, they will have this cookie associated with their browser."
  },
  {
    name: "metagenics_custom_language_checked",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores whether the custom language setting has been initialized on the site."
  },
  {
    name: "mf_has_cookie",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "MoEngage platform cookie confirming cookie storage support is available."
  },
  {
    name: "mf_initialDomQueue",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "MoEngage cookie storing the initial DOM queue for message display sequencing."
  },
  {
    name: "mf_transmitQueue",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "MoEngage cookie storing the transmission queue for analytics events."
  },
  {
    name: "mf_user",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "MoEngage cookie storing user identifier and attributes for personalized messaging."
  },
  {
    name: "mioweb_post_visited_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Mio Web plugin cookie tracking which posts the visitor has already viewed."
  },
  {
    name: "mkdf-post-views_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Mikado (Qode) theme cookie tracking post view counts for the popular posts widget."
  },
  {
    name: "MODsid",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores a session identifier for MODx CMS or similar platform session management."
  },
  {
    name: "mp_",
    vendor: "Mixpanel",
    category: "analytics",
    wildcard: true,
    description: "Used by Mixpanel to track user's activity"
  },
  {
    name: "mp_gen_new_tab_id_mixpanel_904bdada7831fe79c425b3a61c09df7f",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Mixpanel cookie storing a unique tab identifier to deduplicate events across browser tabs."
  },
  {
    name: "mp_tab_id_mixpanel_904bdada7831fe79c425b3a61c09df7f",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Mixpanel cookie storing the current tab's unique identifier for event attribution."
  },
  {
    name: "mpaSessionId",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "MR",
    vendor: "Microsoft Clarity",
    category: "analytics",
    wildcard: false,
    description: "Used by Microsoft Clarity to indicate whether to refresh MUID."
  },
  {
    name: "mrkrui",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Marker.io cookie storing UI state for the visual bug reporting widget."
  },
  {
    name: "MS0",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Microsoft cookie storing an initial session or state identifier for Microsoft services."
  },
  {
    name: "msal.",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Microsoft Authentication Library (MSAL) cookie storing OAuth tokens and session state."
  },
  {
    name: "msd365mkttr",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Microsoft Dynamics 365 Marketing cookie for visitor tracking and attribution."
  },
  {
    name: "msd365mkttrs",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Microsoft Dynamics 365 Marketing session cookie for visitor activity tracking."
  },
  {
    name: "msgsndr_id",
    vendor: "LeadConnector",
    category: "advertisement",
    wildcard: false,
    description: "Identifies visitor contact information to track leads and user activities."
  },
  {
    name: "MSPTC",
    vendor: "Microsoft Ads",
    category: "advertisement",
    wildcard: false,
    description: "Used by Microsoft Advertising to help deliver more relevant ads, limit how often ads are shown, and measure the effectiveness of advertising campaigns."
  },
  {
    name: "msToken",
    vendor: "TikTok Pixel",
    category: "advertisement",
    wildcard: false,
    description: "TikTok security token cookie used to verify legitimate requests to TikTok's services."
  },
  {
    name: "mt_misc",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is owned by MediaMath Inc. a US based digital advertising business."
  },
  {
    name: "mtc_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Mautic tracking cookie storing a contact identifier for marketing automation."
  },
  {
    name: "mtc_sid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Mautic session cookie storing session identifier for contact activity tracking."
  },
  {
    name: "mtm_consent",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by Matomo to remember that consent was given by the user."
  },
  {
    name: "mtm_cookie_consent",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Matomo Tag Manager cookie storing the user's cookie consent status."
  },
  {
    name: "muc_ads",
    vendor: "Twitter / X",
    category: "advertisement",
    wildcard: false,
    description: "This is a cookie that is set by twitter.com. It is used for optimizing ad relevance by collecting visitor navigation data."
  },
  {
    name: "MUID",
    vendor: "Microsoft Ads",
    category: "analytics",
    wildcard: false,
    description: "Microsoft User Identifier tracking cookie used by Bing Ads. It can be set by embedded microsoft scripts. Widely believed to sync across many different Microsoft domains, allowing user tracking."
  },
  {
    name: "muxData",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Mux video analytics cookie storing video performance and quality metrics data."
  },
  {
    name: "mv_tokens",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Stores multiple visitor tokens for multi-touch attribution tracking."
  },
  {
    name: "mv_tokens_eu-v1",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Set by Mediavine to store a visitor\u2019s consent choices for advertising in the EU. This cookie ensures ads are delivered according to GDPR requirements and the user\u2019s preferences."
  },
  {
    name: "MySessionID",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores a unique session identifier to maintain user state across page visits."
  },
  {
    name: "ncore_session",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by DigiMember Wordpress plugin to limit the number of downloads for download products, serve as protection against XSS injections and passes on errors during login itself"
  },
  {
    name: "nette-browser",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Nette Framework PHP cookie storing a browser fingerprint for security validation."
  },
  {
    name: "NEXT_LOCALE",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores the language you selected so the site can be shown in your preferred language on future visits."
  },
  {
    name: "nextauth.message",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "NextAuth.js authentication cookie storing messages for OAuth callback handling."
  },
  {
    name: "NID",
    vendor: "Google Ads",
    category: "advertisement",
    wildcard: false,
    description: "A browser sends this cookie with requests to Google\u2019s sites. The NID cookie contains a unique ID Google uses to remember your preferences and other information, such as your preferred language (e.g. English), how many search results you wish to have shown per page (e.g. 10 or 20), and whether or not you wish to have Google\u2019s SafeSearch filter turned on."
  },
  {
    name: "nitro_prefetched_urls",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "WP Rocket Nitro cache cookie tracking prefetched URLs for performance optimization."
  },
  {
    name: "nitroCachedPage",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by NitroPack to indicate that a cached version of the page was served. This improves site performance and loading speed. No personal data is stored."
  },
  {
    name: "nlbi_",
    vendor: "Unknown",
    category: "necessary",
    wildcard: true,
    description: "Imperva/Incapsula load balancer cookie routing requests to the same backend server."
  },
  {
    name: "nmstat",
    vendor: "Siteimprove",
    category: "analytics",
    wildcard: false,
    description: "This cookie is used to help record visitors' use of the website.\r\nIt is used to collect statistics about site usage such as when the visitor last visited the site.\r\nThis information is then used to improve the user experience on the website. This Siteimprove Analytics cookie contains a randomly generated ID used to recognize the browser when a visitor reads a page.\r\nThe cookie contains no personal information and is used only for web analytics."
  },
  {
    name: "notice_behavior",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores user behavior related to cookie consent notices for display rules."
  },
  {
    name: "nQ_cookieId",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Nuance/Microsoft cookie storing a visitor ID for digital engagement tracking."
  },
  {
    name: "nQ_userVisitId",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Nuance/Microsoft cookie storing a visit identifier for user journey tracking."
  },
  {
    name: "NRBA_SESSION",
    vendor: "New Relic",
    category: "necessary",
    wildcard: false,
    description: "Used by New relic to collect telemetry data such as page load times, JavaScript errors, and other performance metrics."
  },
  {
    name: "nrid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a numeric visitor identifier for analytics or ad targeting."
  },
  {
    name: "nsid",
    vendor: "Paypal",
    category: "necessary",
    wildcard: false,
    description: "Used by PayPal for secure payment services"
  },
  {
    name: "oa-dao-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Oracle Advertising cookie for audience data collection and retargeting."
  },
  {
    name: "OAID",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Associated with the OpenX banner advertising platform for publishers. Records whether specific ads have been displayed. Reportedly used for performance only rather than user targeting. As a first party cookie it cannot be used to track across domains."
  },
  {
    name: "OCSESSID",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by OpenCart to store unique session ID to maintain state"
  },
  {
    name: "october_session",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "odStorageLockTime",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the lock time for OmniDesk or similar platform storage operations."
  },
  {
    name: "odSubmitted-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records which forms or requests have been submitted to prevent duplicate submissions."
  },
  {
    name: "OIDC",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "OpenID Connect cookie storing authentication state during the OIDC login flow."
  },
  {
    name: "om-country",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user's country detected by OptinMonster for display targeting rules."
  },
  {
    name: "om-ip_block",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "OptinMonster cookie storing IP block list data for display targeting rules."
  },
  {
    name: "omnisendSessionID",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Used by Omnisend to identify a session of an anonymous contact or a contact"
  },
  {
    name: "omScrollHeight",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores page scroll height data for user behavior analytics."
  },
  {
    name: "omSessionPageviews",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Counts the number of pages viewed within the current analytics session."
  },
  {
    name: "omSessionStart",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records the timestamp when the current analytics session began."
  },
  {
    name: "omVisits",
    vendor: "OptinMonster",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is set by OptinMonster and is used to hold the journey data for a specific visitor on a site."
  },
  {
    name: "omVisitsFirst",
    vendor: "OptinMonster",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is set by OptinMonster and is used to hold page, referrer and timestamp data for when a specific visitor first visited a site."
  },
  {
    name: "opt_out",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records whether the user has opted out of tracking or analytics data collection."
  },
  {
    name: "OptanonAlertBoxClosed",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "OptanonConsent",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Contain the consent status of a visitor is indicated using the first party OptanonConsent cookie."
  },
  {
    name: "optimizely_data",
    vendor: "Optimizely",
    category: "analytics",
    wildcard: false,
    description: "Stores visitor IDs, experiment assignments, events, and session data to deliver consistent, personalized experiences and analyze visitor interactions for A/B testing and optimization."
  },
  {
    name: "optiMonkClient",
    vendor: "OptiMonk",
    category: "analytics",
    wildcard: false,
    description: "Used to remember visitors and manage personalized popups, ensuring offers are shown at the right time and not repeated unnecessarily."
  },
  {
    name: "optiMonkClientId",
    vendor: "OptiMonk",
    category: "analytics",
    wildcard: false,
    description: "Set by OptiMonk to assign a unique ID to each visitor. This cookie helps recognize returning visitors, control popup displays, and measure the performance of personalized campaigns."
  },
  {
    name: "optiMonkSession",
    vendor: "OptiMonk",
    category: "analytics",
    wildcard: false,
    description: "Used to remember visitors and manage personalized popups, ensuring offers are shown at the right time and not repeated unnecessarily."
  },
  {
    name: "OptiMonkShopAttributes",
    vendor: "OptiMonk",
    category: "analytics",
    wildcard: false,
    description: "Used to remember visitors and manage personalized popups, ensuring offers are shown at the right time and not repeated unnecessarily."
  },
  {
    name: "OptiMonkVisitorAttributes",
    vendor: "OptiMonk",
    category: "analytics",
    wildcard: false,
    description: "Used to remember visitors and manage personalized popups, ensuring offers are shown at the right time and not repeated unnecessarily."
  },
  {
    name: "ouid",
    vendor: "AddThis",
    category: "performance",
    wildcard: false,
    description: "The cookie is set by Addthis which enables the content of the website to be shared across different networking and social sharing websites."
  },
  {
    name: "OutSavvyQueueAccess",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "OutSavvy ticketing platform cookie storing queue access tokens for event ticket sales."
  },
  {
    name: "pageAccessData_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Stores page access control data for managing gated content visibility."
  },
  {
    name: "PAPVisitorId",
    vendor: "Post Affiliate Pro",
    category: "analytics",
    wildcard: false,
    description: "Set by Post Affiliate Pro to assign a unique ID to each visitor. This cookie is used to track affiliate referrals and conversions, ensuring that sales or signups are attributed to the correct affiliate partner."
  },
  {
    name: "parking_session",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Created by the domain parking platform to identify a visitor\u2019s browsing session. This cookie helps measure traffic on parked domains, prevent fraud, and deliver ads consistently during a single visit."
  },
  {
    name: "Path",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a path preference or navigation state for the current user session."
  },
  {
    name: "pbid",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by PixelYourSite, allowing the plugin to assign external_id to users, improving API events performance."
  },
  {
    name: "pdfjs.history",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "PermanentDownloadCode",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores a permanent code for authenticating access to file downloads."
  },
  {
    name: "persisted-queue:",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a persisted event queue for offline-capable analytics or messaging."
  },
  {
    name: "personalization_id",
    vendor: "Twitter / X",
    category: "advertisement",
    wildcard: false,
    description: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website."
  },
  {
    name: "pf_ptc_",
    vendor: "Proof Factor",
    category: "advertisement",
    wildcard: true,
    description: "Keeps a counter of how many times a visitor views a specific page during a session. This allows the site to limit or adjust how often popups or notifications are shown on the same page."
  },
  {
    name: "PH_HPXY_CHECK",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "ph_phc_",
    vendor: "PostHog Analytics",
    category: "analytics",
    wildcard: true,
    description: "Used by Posthog Analytics to get insights into their user behavior"
  },
  {
    name: "PHPSESSID",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Cookie generated by applications based on the PHP language. This is a general purpose identifier used to maintain user session variables. It is normally a random generated number, how it is used can be specific to the site, but a good example is maintaining a logged-in status for a user between pages."
  },
  {
    name: "pid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a persistent visitor or partner identifier for tracking."
  },
  {
    name: "pixel",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores pixel tracking data for conversion measurement and retargeting campaigns."
  },
  {
    name: "player",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores media player state such as volume and playback preferences."
  },
  {
    name: "pll_language",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "This cookie is used to remember the language selected by the user when he comes back to visit again the website by Polylang"
  },
  {
    name: "plyr",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Plyr HTML5 media player cookie storing user preferences like volume and playback speed."
  },
  {
    name: "poptin_all_visited_pages",
    vendor: "Poptin",
    category: "analytics",
    wildcard: false,
    description: "Keeps a list of all pages viewed by the visitor on the site. Supports advanced targeting rules in Poptin campaigns."
  },
  {
    name: "poptin_c_visitor",
    vendor: "Poptin",
    category: "analytics",
    wildcard: false,
    description: "Marks the visitor as counted in campaign statistics. Helps Poptin measure popup impressions and engagement."
  },
  {
    name: "poptin_client_id",
    vendor: "Poptin",
    category: "analytics",
    wildcard: false,
    description: "Unique identifier assigned by Poptin to the browser. Supports tracking of visitor sessions and campaign reporting."
  },
  {
    name: "poptin_custom_new_visitor_session",
    vendor: "Poptin",
    category: "analytics",
    wildcard: false,
    description: "Marks a session as belonging to a new visitor according to custom campaign settings. Used for personalized popup targeting."
  },
  {
    name: "poptin_every_visit_session",
    vendor: "Poptin",
    category: "analytics",
    wildcard: false,
    description: "Poptin popup platform cookie tracking each visit session for popup display frequency control."
  },
  {
    name: "poptin_last_visit",
    vendor: "Poptin",
    category: "analytics",
    wildcard: false,
    description: "Records the time and date of the visitor\u2019s last visit. Used to identify returning visitors and control popup frequency."
  },
  {
    name: "poptin_new_user",
    vendor: "Poptin",
    category: "analytics",
    wildcard: false,
    description: "Marks a visitor as new. Helps Poptin show popups or offers specifically for first-time visitors."
  },
  {
    name: "poptin_o_",
    vendor: "Poptin",
    category: "analytics",
    wildcard: true,
    description: "Campaign-specific tracking cookie. Stores details about popup impressions and conversions for a particular Poptin campaign."
  },
  {
    name: "poptin_old_user",
    vendor: "Poptin",
    category: "analytics",
    wildcard: false,
    description: "Identifies visitors who have previously interacted with a popup or form. Prevents the same popup from being shown again."
  },
  {
    name: "poptin_origin_landing_page",
    vendor: "Poptin",
    category: "analytics",
    wildcard: false,
    description: "Stores the first landing page the visitor arrived on. Used for targeting and measuring campaign effectiveness."
  },
  {
    name: "poptin_pageviews_",
    vendor: "Poptin",
    category: "analytics",
    wildcard: true,
    description: "Counts the number of page views during the session. Helps Poptin trigger popups based on visitor engagement."
  },
  {
    name: "poptin_previous_url",
    vendor: "Poptin",
    category: "analytics",
    wildcard: false,
    description: "Records the last page visited by the visitor. Used for conditional display of popups based on navigation history."
  },
  {
    name: "poptin_session",
    vendor: "Poptin",
    category: "analytics",
    wildcard: false,
    description: "Set by Poptin to manage the visitor\u2019s session and track interactions with popups and forms."
  },
  {
    name: "poptin_session_account_",
    vendor: "Poptin",
    category: "analytics",
    wildcard: true,
    description: "Session cookie tied to a specific Poptin account. Tracks interactions with popups and forms for that account only."
  },
  {
    name: "poptin_user_country_code",
    vendor: "Poptin",
    category: "analytics",
    wildcard: false,
    description: "Saves the visitor\u2019s country code. Allows popups or forms to be targeted by geographic region."
  },
  {
    name: "poptin_user_id",
    vendor: "Poptin",
    category: "analytics",
    wildcard: false,
    description: "Assigns a unique ID to each visitor. Used to recognize returning visitors across sessions and track popup interactions."
  },
  {
    name: "poptin_user_ip",
    vendor: "Poptin",
    category: "analytics",
    wildcard: false,
    description: "Stores the visitor\u2019s IP address. Used by Poptin to detect location and prevent duplicate submissions."
  },
  {
    name: "popup-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores state of popup display, tracking whether a popup has been shown to the user."
  },
  {
    name: "positions",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores position data for UI elements or product listing sort preferences."
  },
  {
    name: "POWR_PRODUCTION",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "POWR apps cookie storing widget production environment state."
  },
  {
    name: "ppms_privacy_",
    vendor: "Piwik PRO",
    category: "necessary",
    wildcard: true,
    description: "Used by Piwik to store visitor\u2019s consent to data collection and usage."
  },
  {
    name: "PrestaShop-",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "PrestaShop e-commerce platform cookie storing session and cart data."
  },
  {
    name: "prism_",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: true,
    description: "Used by ActiveCampaign to track visitors across marketing channels."
  },
  {
    name: "private_content_version",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Magento cookie storing a version hash to manage private content cache invalidation."
  },
  {
    name: "prli_click_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Pretty Links plugin cookie tracking affiliate link clicks for conversion attribution."
  },
  {
    name: "prli_visitor",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Pretty Links plugin cookie identifying returning visitors for affiliate tracking."
  },
  {
    name: "product_data_storage",
    vendor: "Magento",
    category: "performance",
    wildcard: false,
    description: "Used by Magento to store configuration for product data related to Recently Viewed / Compared Products."
  },
  {
    name: "publishedsite-xsrf",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "PublishedSiteSession",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Session cookie for Squarespace or similar published site management."
  },
  {
    name: "PugT",
    vendor: "PubMatic",
    category: "analytics",
    wildcard: false,
    description: "Used to determine the number of times the cookies have been updated in the visitor's browser. Used to optimize the website's server efficiency."
  },
  {
    name: "pvc_visits[0]",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Post Views Counter plugin cookie tracking the number of views for each post."
  },
  {
    name: "PVID",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "pvisitor",
    vendor: "GoDaddy Domain Parking",
    category: "advertisement",
    wildcard: false,
    description: "Assigns a unique ID to each visitor for session tracking, fraud prevention, and ad performance measurement."
  },
  {
    name: "pwvisitor",
    vendor: "GoDaddy Domain Parking",
    category: "advertisement",
    wildcard: false,
    description: "GoDaddy Domain Parking advertising cookie used for ad targeting, retargeting, and campaign attribution."
  },
  {
    name: "pxrc",
    vendor: "Rapleaf",
    category: "advertisement",
    wildcard: false,
    description: "The cookie is set by Rapleaf to identify a visitor to serve relevant advertisement."
  },
  {
    name: "pys_first_visit",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by PixelYourSite to configure the type of WooCommerce reports the plugin will track."
  },
  {
    name: "pys_landing_page",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "This cookie is set by the PixelYourSite plugin that manages analytical services."
  },
  {
    name: "pys_session_limit",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by PixelYourSite to configure the duration of a session, used for WooCommerce and EDD reports."
  },
  {
    name: "pys_start_session",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by PixelYourSite to start a session, used for WooCommerce and EDD reports."
  },
  {
    name: "pysTrafficSource",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "It allows the plugin to track the traffic source."
  },
  {
    name: "qtrans_front_language",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "qTranslate multilingual WordPress plugin cookie storing the user's language preference."
  },
  {
    name: "quform_session_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "QForm WordPress plugin cookie storing form session data for multi-step forms."
  },
  {
    name: "receive-cookie-deprecation",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Privacy Sandbox testing cookie to preview how site behavior and functionality work without third-party cookies."
  },
  {
    name: "recently_compared_product",
    vendor: "Magento",
    category: "performance",
    wildcard: false,
    description: "Used by Magento to store product IDs of recently compared products."
  },
  {
    name: "recently_compared_product_previous",
    vendor: "Magento",
    category: "performance",
    wildcard: false,
    description: "Used by Magento to store product IDs of previously compared products."
  },
  {
    name: "recently_viewed_product",
    vendor: "Magento",
    category: "performance",
    wildcard: false,
    description: "Used by Magento to store product IDs of recently viewed products for easy navigation."
  },
  {
    name: "recently_viewed_product_previous",
    vendor: "Magento",
    category: "performance",
    wildcard: false,
    description: "Used by Magento to store product IDs of recently previously viewed products for easy navigation."
  },
  {
    name: "RecentRedirect",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores the URL of the most recent redirect to prevent navigation loops."
  },
  {
    name: "recordID",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the identifier of the current record being viewed for CRM or CMS context."
  },
  {
    name: "remixlang",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "This cookie helps us customize our site content based on your preferences. It remembers choices you make, your language and the country you visit our website from. The information this cookie collects may be anonymised and it cannot track your browsing activity on other websites."
  },
  {
    name: "remixstlid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Remix framework cookie storing the stable layout identifier for navigation state."
  },
  {
    name: "resolution",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Determines which device is used by the visitor - This allows the web site to adjust to the optimal resolution for that specific device."
  },
  {
    name: "rl_anonymous_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "RudderStack cookie storing an anonymous identifier for users before identification."
  },
  {
    name: "rl_page_init_referrer",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "RudderStack cookie storing the initial referrer URL for attribution tracking."
  },
  {
    name: "rl_session",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "RudderStack cookie storing the current session data for analytics event batching."
  },
  {
    name: "rlas3",
    vendor: "Rapleaf",
    category: "advertisement",
    wildcard: false,
    description: "The cookie is used by Rapleaf to serve relevant ads to the visitor as well as limit the time the visitor sees an ad and also measure the effectiveness of the campaign."
  },
  {
    name: "route",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Load balancer or routing cookie directing user requests to a consistent backend server."
  },
  {
    name: "RT",
    vendor: "Akamai",
    category: "necessary",
    wildcard: false,
    description: "This cookie is necessary for the Akamai cache function. A cache is used by the website to optimize the response time between the visitor and the website. This cookie contains information on the users session to support Akamais cache functionality, it helps us to measure the loading times of individual pages, which we can use to analyse and improve our website."
  },
  {
    name: "rudder_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "RudderStack customer data platform cookie storing user identifier and tracking data."
  },
  {
    name: "s",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Generic short-form session or state identifier cookie for analytics or personalization."
  },
  {
    name: "s_cc",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Adobe Site Catalyst cookie, determines whether cookies are enabled in the browser."
  },
  {
    name: "sa-user-id",
    vendor: "StackAdapt",
    category: "advertisement",
    wildcard: false,
    description: "Stack Adapt advertising first-party cookie. Used by Stack Adapt to track visits across websites to deliver a series of advertisement products such as real time bidding from third party advertisers."
  },
  {
    name: "sa-user-id-v2",
    vendor: "StackAdapt",
    category: "advertisement",
    wildcard: false,
    description: "Stack Adapt advertising first-party cookie. Used by Stack Adapt to track visits across websites to deliver a series of advertisement products such as real time bidding from third party advertisers."
  },
  {
    name: "sa-user-id-v3",
    vendor: "StackAdapt",
    category: "advertisement",
    wildcard: false,
    description: "Stack Adapt advertising first-party cookie. Used by Stack Adapt to track visits across websites to deliver a series of advertisement products such as real time bidding from third party advertisers."
  },
  {
    name: "SavedCookiesActive",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Cookie required for the website to function correctly and maintain session state."
  },
  {
    name: "sb_wiz.zpc.gws-wiz.",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Google Search autocomplete wizard cookie storing search interaction state."
  },
  {
    name: "sbjs_current",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by Sourcebuster to track the sources of website\u2019s visitors for further analysis."
  },
  {
    name: "sbjs_current_add",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by Sourcebuster to track the sources of website\u2019s visitors for further analysis."
  },
  {
    name: "sbjs_first",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by Sourcebuster to track the sources of website\u2019s visitors for further analysis."
  },
  {
    name: "sbjs_first_add",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by Sourcebuster to track the sources of website\u2019s visitors for further analysis."
  },
  {
    name: "sbjs_migrations",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by Sourcebuster to track the sources of website\u2019s visitors for further analysis."
  },
  {
    name: "sbjs_session",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by Sourcebuster to track the sources of website\u2019s visitors for further analysis."
  },
  {
    name: "sbjs_udata",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Used by Sourcebuster to track the sources of website\u2019s visitors for further analysis."
  },
  {
    name: "sc_at",
    vendor: "Snapchat",
    category: "analytics",
    wildcard: false,
    description: "Used to identify a visitor across multiple domains."
  },
  {
    name: "sc_f",
    vendor: "Paypal",
    category: "necessary",
    wildcard: false,
    description: "Set by PayPal when displaying the PayPal payment button. It helps PayPal recognize the visitor\u2019s browser, provide a secure checkout experience, and prevent fraud."
  },
  {
    name: "sc_is_visitor_unique",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Snapchat cookie recording whether the visitor is unique for pixel deduplication."
  },
  {
    name: "sc_medium_source",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Snapchat cookie storing the traffic medium and source for ad attribution."
  },
  {
    name: "search_initialization_code_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Stores initialization code for search widget setup and configuration."
  },
  {
    name: "search_initialization_hash_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Stores a hash of search initialization parameters for cache validation."
  },
  {
    name: "search_result_styles_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Stores search result display style preferences for the user."
  },
  {
    name: "search_style_hash_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Stores a hash of search style settings for cache invalidation."
  },
  {
    name: "searchsort",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user's selected sort order for search results."
  },
  {
    name: "section_data_clean",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Magento cookie indicating whether section data cache has been cleared."
  },
  {
    name: "section_data_ids",
    vendor: "Magento",
    category: "necessary",
    wildcard: false,
    description: "Stores customer-specific information related to shopper-initiated actions such as display wish list, checkout information, etc."
  },
  {
    name: "secure_customer_sig",
    vendor: "Shopify",
    category: "necessary",
    wildcard: false,
    description: "Used by Shopify in connection with customer login."
  },
  {
    name: "sentryReplaySession",
    vendor: "Sentry Session Replay",
    category: "analytics",
    wildcard: false,
    description: "Stores a session identifier for capturing user interactions during a session for error analysis and performance troubleshooting."
  },
  {
    name: "server-session-bind",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by our server or load balancer to link your browser with its server-side session. This cookie ensures requests go to the same backend session for consistent service delivery."
  },
  {
    name: "SERVERID",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Used by HAProxy to assign the user to a specific server, thus to provide an improved and faster server time. It remembers which server had delivered the last page on to the browser and helps in load balancing."
  },
  {
    name: "SERVERID77446",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Cookie required for the website to function correctly and maintain session state."
  },
  {
    name: "session",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Cookie required for the website to function correctly and maintain session state."
  },
  {
    name: "session_id",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores the user session identifier to maintain login state across page loads."
  },
  {
    name: "session-",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Cookie required for the website to function correctly and maintain session state."
  },
  {
    name: "session-details",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "session-id",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Cookie required for the website to function correctly and maintain session state."
  },
  {
    name: "sessionId",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Preserves users states across page requests."
  },
  {
    name: "sessionordine",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "sessionPersist",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "SEUNCY",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is owned by Semasio, a German business specialising in profiling and behavioral targeting of consumers."
  },
  {
    name: "sf-pxs",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Salesforce pixel session cookie for tracking visitor interactions with Salesforce Marketing Cloud."
  },
  {
    name: "sfpxs",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Salesforce pixel session identifier for Marketing Cloud tracking continuity."
  },
  {
    name: "sgid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a session group identifier for tracking related user sessions."
  },
  {
    name: "SharedSessionId",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Shares a session identifier across multiple services or subdomains for unified authentication."
  },
  {
    name: "shop_client_item_basketshow_mask",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "E-commerce cookie storing basket display mask settings for the shopping cart UI."
  },
  {
    name: "shop_client_item_celkempocet_mask",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "E-commerce cookie storing item count mask settings for the shopping cart."
  },
  {
    name: "shopify_pay_redirect",
    vendor: "Shopify",
    category: "necessary",
    wildcard: false,
    description: "Used by Shopify in connection with checkout"
  },
  {
    name: "shopifyChatData",
    vendor: "Shopify",
    category: "performance",
    wildcard: false,
    description: "Supports Shopify\u2019s live chat or customer service tools."
  },
  {
    name: "SHR_CACHE_facebook_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Social sharing cache cookie storing Facebook share count data for display."
  },
  {
    name: "SHR_CACHE_pinterest_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Social sharing cache cookie storing Pinterest share count data for display."
  },
  {
    name: "SHR_CACHE_twitter_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Social sharing cache cookie storing Twitter/X share count data for display."
  },
  {
    name: "sib_cuid",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Used by Sendinblue to link website activity with marketing campaigns. Supports marketing automation, personalization, lead scoring, and retargeting."
  },
  {
    name: "sid",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores a session identifier for user authentication and state management."
  },
  {
    name: "siqlsdb",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a query or database session identifier for search indexing operations."
  },
  {
    name: "site_session",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a site-specific session identifier for user state management."
  },
  {
    name: "SkarabeeCMS-search",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "SkarabeeCMS cookie storing search query data for search history features."
  },
  {
    name: "SkarabeeCMS-search-results",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "SkarabeeCMS cookie storing search results cache for performance optimization."
  },
  {
    name: "SM",
    vendor: "Microsoft Clarity",
    category: "analytics",
    wildcard: false,
    description: "This cookie is installed by Clarity. The cookie is used to store non-personally identifiable information. The cookie is used in synchronizing the MUID (Microsoft unique user ID) across Microsoft domains."
  },
  {
    name: "smsbump_form_pages_session",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "SMSBump/Yotpo SMS marketing cookie tracking pages visited in the current session."
  },
  {
    name: "smsbump_form_visited_pages",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "SMSBump/Yotpo cookie storing the list of pages visited for popup display rules."
  },
  {
    name: "smuuid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "SumoMe/Sumo cookie storing a unique visitor UUID for email capture and analytics."
  },
  {
    name: "smvr",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "SumoMe/Sumo cookie storing visitor data for email capture widget behavior."
  },
  {
    name: "sn_global_countdown_last_reset_timestamp",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Used by Sleeknote and contains a timestamp that resets every time a new page is loaded."
  },
  {
    name: "SN_SS-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Social network session cookie for managing authenticated social platform sessions."
  },
  {
    name: "snowplowOutQueue_",
    vendor: "Snowplow",
    category: "analytics",
    wildcard: true,
    description: "Used by Snowplow to store a cache of unsent events. This is used to reduce the chance of events to be lost due to page navigation and events not being set to the collector before the navigation event occurs."
  },
  {
    name: "SNS",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Used by Sleeknote to make sure that one-time operations only run once."
  },
  {
    name: "socialsnap_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Social Snap sharing plugin cookie storing share count cache and user interaction data."
  },
  {
    name: "SOCS",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Google's cookie storing user's cookie consent choices across Google services."
  },
  {
    name: "soundestID",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Used by Omnisend to identify an anonymous contact."
  },
  {
    name: "sp",
    vendor: "Snowplow",
    category: "analytics",
    wildcard: false,
    description: "Used by Snowplow to store a server-side collector generated unique identifier for a user that is sent with all subsequent tracking event events."
  },
  {
    name: "sp_landing",
    vendor: "Spotify",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is set by the provider Spotify. This cookie is used to implement audio content from spotify on the website. It also helps in collecting information on user interaction with this audio content."
  },
  {
    name: "sp_t",
    vendor: "Spotify",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is set by the provider Spotify. This cookie is used to implement audio content from spotify on the website. It also helps in collecting information on user interaction with this audio content."
  },
  {
    name: "spdt-",
    vendor: "Spotify",
    category: "advertisement",
    wildcard: false,
    description: "Used by Spotify to store a unique identifier for the user or browser. This identifier supports advertising campaigns by tracking ad interactions, measuring effectiveness, and enabling campaign optimization."
  },
  {
    name: "squarespace-announcement-bar",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Squarespace cookie storing whether the announcement bar has been dismissed."
  },
  {
    name: "squarespace-video-player-options",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Squarespace cookie storing user preferences for the video player (volume, autoplay)."
  },
  {
    name: "src",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the traffic source parameter for marketing attribution tracking."
  },
  {
    name: "SRM_B",
    vendor: "Microsoft Ads",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is installed by Microsoft Bing. Identifies unique web browsers visiting Microsoft sites."
  },
  {
    name: "ss_cvr",
    vendor: "Squarespace",
    category: "analytics",
    wildcard: false,
    description: "A Squarespace cookie that identifies unique visitors and tracks a visitor\u2019s sessions on a site."
  },
  {
    name: "ss_cvt",
    vendor: "Squarespace",
    category: "analytics",
    wildcard: false,
    description: "A Squarespace cookie that identifies unique visitors and tracks a visitor\u2019s sessions on a site."
  },
  {
    name: "SSC_SS-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Secure session cookie for managing authenticated sessions with SSC prefix."
  },
  {
    name: "SSESS",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores Drupal session data to maintain user authentication state."
  },
  {
    name: "ssi--lastInteraction",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the timestamp of the user's last interaction for session timeout management."
  },
  {
    name: "ssi--sessionId",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the session identifier for SSI platform or server-side includes tracking."
  },
  {
    name: "ssr-caching",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Session cookie indication how a site was rendered."
  },
  {
    name: "ssupp_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Smartsupp live chat cookie storing visitor session data for chat history."
  },
  {
    name: "ssupp.vid",
    vendor: "SmartSupp",
    category: "necessary",
    wildcard: false,
    description: "This cookie is set by SmartSupp for the live chat box functionality on the website and is used to store a unique user identifier."
  },
  {
    name: "starapps_storefront_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Starapps Shopify app cookie for storefront session and feature tracking."
  },
  {
    name: "statcounter_bounce",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "StatCounter cookie tracking bounce status to measure single-page visit rates."
  },
  {
    name: "statcounter_config",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "StatCounter cookie storing configuration data for the analytics tracking script."
  },
  {
    name: "statcounter_session",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "StatCounter cookie storing session data for visitor analytics tracking."
  },
  {
    name: "stg_last_interaction",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Piwik PRO Tag Manager cookie storing the timestamp of the user's last interaction."
  },
  {
    name: "stg_returning_visitor",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Piwik PRO cookie recording whether the visitor has previously visited the site."
  },
  {
    name: "stg_traffic_source_priority",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Piwik PRO cookie storing the priority order of traffic sources for attribution."
  },
  {
    name: "sto-id-editor",
    vendor: "Weebly",
    category: "necessary",
    wildcard: false,
    description: "This cookie is set by Weebly as a session cookie and is most likely being used to manage the state of your session as you use it. It is deleted when you leave the website."
  },
  {
    name: "sto-id-pages-k8s",
    vendor: "Weebly",
    category: "necessary",
    wildcard: false,
    description: "Set by Weebly\u2019s hosting platform to manage load balancing. This cookie keeps the visitor connected to the same server during a session, ensuring the website works reliably."
  },
  {
    name: "store",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the selected store identifier for multi-store e-commerce platforms."
  },
  {
    name: "storeApiCartData",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores cart API data for maintaining cart state in headless commerce implementations."
  },
  {
    name: "storeApiNonce",
    vendor: "WooCommerce",
    category: "necessary",
    wildcard: false,
    description: "Used by your WooCommerce store to make sure actions (like adding to cart) are valid and secure."
  },
  {
    name: "StoreInfo",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores information about the selected store for multi-store e-commerce sites."
  },
  {
    name: "suid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a session user identifier for tracking user activity."
  },
  {
    name: "SULUSESSID",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Sulu CMS session cookie for maintaining user authentication state."
  },
  {
    name: "svSession",
    vendor: "Wix",
    category: "analytics",
    wildcard: false,
    description: "Identifies unique visitors and tracks a visitor\u2019s sessions on a site"
  },
  {
    name: "swpm_session",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "SWPM membership plugin cookie storing session data for member authentication."
  },
  {
    name: "sync_cookie_csrf",
    vendor: "Yandex.Metrika",
    category: "performance",
    wildcard: false,
    description: "This is a Yandex Cookie. It is used for security purposes in order to avoid Cross-Site Request Forgery, (CSRF)."
  },
  {
    name: "sync_cookie_csrf_secondary",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a secondary CSRF token for cross-site synchronization security."
  },
  {
    name: "sync_cookie_ok",
    vendor: "Yandex.Metrika",
    category: "analytics",
    wildcard: false,
    description: "Used by Yandex Metrica to survey and track user behavior."
  },
  {
    name: "sync_cookie_ok_secondary",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Confirms successful secondary cookie synchronization for cross-domain tracking."
  },
  {
    name: "system",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores system-level configuration or state data for platform initialization."
  },
  {
    name: "szn:idnts:cch",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Seznam.cz Czech search engine cookie storing identity cache for user recognition."
  },
  {
    name: "t",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Generic single-character tracking or session identifier cookie."
  },
  {
    name: "t3D",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the site\u2019s carousel component to remember browser capabilities"
  },
  {
    name: "tADe",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the site\u2019s carousel component to remember browser capabilities"
  },
  {
    name: "tADu",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the site\u2019s carousel component to remember browser capabilities"
  },
  {
    name: "tAE",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the site\u2019s carousel component to remember browser capabilities"
  },
  {
    name: "TapAd_3WAY_SYNCS",
    vendor: "Tapad",
    category: "advertisement",
    wildcard: false,
    description: "The cookie is set by Tapad.com. The purpose of the cookie is to track users across devices to enable targeted advertising."
  },
  {
    name: "TapAd_DID",
    vendor: "Tapad",
    category: "advertisement",
    wildcard: false,
    description: "The cookie is set by Tapad.com. The purpose of the cookie is to track users across devices to enable targeted advertising."
  },
  {
    name: "TapAd_TS",
    vendor: "Tapad",
    category: "advertisement",
    wildcard: false,
    description: "The cookie is set by Tapad.com. The purpose of the cookie is to track users across devices to enable targeted advertising."
  },
  {
    name: "TAsessionID",
    vendor: "TrustArc",
    category: "necessary",
    wildcard: false,
    description: "Set by TrustArc\u2019s Cookie Consent Manager. It stores a temporary identifier used to manage consent interactions and reporting."
  },
  {
    name: "tC",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the site\u2019s carousel component to remember browser capabilities"
  },
  {
    name: "TDCPM",
    vendor: "The Trade Desk",
    category: "advertisement",
    wildcard: false,
    description: "Registers a unique ID that identifies a returning visitor's device. The ID is used for targeted ads."
  },
  {
    name: "TDID",
    vendor: "The Trade Desk",
    category: "advertisement",
    wildcard: false,
    description: "Registers a unique ID that identifies a returning visitor's device. The ID is used for targeted ads."
  },
  {
    name: "tdvp_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "The Trade Desk visitor profile cookie storing audience segment data for ad targeting."
  },
  {
    name: "TERMLY_API_CACHE",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Termly cookie storing cached consent management API responses for faster loading."
  },
  {
    name: "test",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Browser capability test cookie used to verify that cookies can be set and read."
  },
  {
    name: "tf_respondent_cc",
    vendor: "Typeform",
    category: "advertisement",
    wildcard: false,
    description: "Set by Typeform to store the visitor\u2019s country code. This helps display forms with the correct regional settings and supports reporting on form responses."
  },
  {
    name: "tgt:tlm:",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Target tagging and lifecycle management cookie for user journey tracking."
  },
  {
    name: "tidio_state_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Tidio live chat cookie storing the state of the chat widget for returning visitors."
  },
  {
    name: "timezone",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user detected timezone for displaying localized times and dates."
  },
  {
    name: "TiPMix",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Registers which server-cluster is serving the visitor. This is used in context with load balancing, in order to optimize user experience."
  },
  {
    name: "tk_ai",
    vendor: "WooCommerce",
    category: "analytics",
    wildcard: false,
    description: "Stores a randomly-generated anonymous ID."
  },
  {
    name: "tk_lr",
    vendor: "WooCommerce",
    category: "analytics",
    wildcard: false,
    description: "Referral cookies used to analyse referrer behavior for Jetpack connected sites using WooCommerce."
  },
  {
    name: "tk_or",
    vendor: "WooCommerce",
    category: "analytics",
    wildcard: false,
    description: "Referral cookies used to analyse referrer behavior for Jetpack connected sites using WooCommerce."
  },
  {
    name: "tk_qs",
    vendor: "Wordpress",
    category: "analytics",
    wildcard: false,
    description: "This cookie is used by WordPress to analyze how the site services are used and to improve the behavior of the website users."
  },
  {
    name: "tk_r3d",
    vendor: "WooCommerce",
    category: "analytics",
    wildcard: false,
    description: "Referral cookies used to analyse referrer behavior for Jetpack connected sites using WooCommerce."
  },
  {
    name: "tl_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "Used by Thrive Leads to store page visit data, including: IP address, referrer, source, medium, campaign and e-mail address"
  },
  {
    name: "tmary",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a temporary array of tracking or marketing data for session analytics."
  },
  {
    name: "tMQ",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the site\u2019s carousel component to remember browser capabilities"
  },
  {
    name: "tmr_detect",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Mail.ru Top@Mail.Ru Retargeting cookie for bot detection and visitor verification."
  },
  {
    name: "tnsApp",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the site\u2019s carousel component to remember browser capabilities"
  },
  {
    name: "topicsLastReferenceTime",
    vendor: "Meta Pixel",
    category: "advertisement",
    wildcard: false,
    description: "Used by Meta Pixel to remember the last time it checked browser topics for personalized advertising."
  },
  {
    name: "tPL",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the site\u2019s carousel component to remember browser capabilities"
  },
  {
    name: "traffic_target",
    vendor: "GoDaddy Domain Parking",
    category: "advertisement",
    wildcard: false,
    description: "Identifies the target traffic source to ensure ad impressions and visits are attributed properly."
  },
  {
    name: "trustedsite_tm_float_seen",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "TrustedSite cookie tracking whether the trust badge floating widget has been displayed."
  },
  {
    name: "trustedsite_visit",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "TrustedSite cookie recording visit data for verified trust badge eligibility."
  },
  {
    name: "trx_addons_is_retina",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "ThemeREX Addons cookie storing whether the visitor's display is retina or HiDPI."
  },
  {
    name: "ts",
    vendor: "Paypal",
    category: "necessary",
    wildcard: false,
    description: "Used in context with the PayPal payment-function on the website. The cookie is necessary for making a safe transaction through PayPal."
  },
  {
    name: "ts_c",
    vendor: "Paypal",
    category: "necessary",
    wildcard: false,
    description: "Used in context with the PayPal payment-function on the website. The cookie is necessary for making a safe transaction through PayPal."
  },
  {
    name: "TS014f319e",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the website\u2019s security system (F5 BIG-IP). It is used to keep your session secure and make sure your requests are routed correctly."
  },
  {
    name: "TS6e63fb46027",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the website\u2019s security system (F5 BIG-IP). It is used to keep your session secure and make sure your requests are routed correctly."
  },
  {
    name: "tsrce",
    vendor: "Paypal",
    category: "necessary",
    wildcard: false,
    description: "Used in context with the PayPal payment-function on the website. The cookie is necessary for making a safe transaction through PayPal."
  },
  {
    name: "tt_appInfo",
    vendor: "TikTok Pixel",
    category: "advertisement",
    wildcard: false,
    description: "Stores app/page context information that helps TikTok attribute events correctly (e.g., which pixel, which page instance)."
  },
  {
    name: "tt_appInfo_v2",
    vendor: "TikTok Pixel",
    category: "advertisement",
    wildcard: false,
    description: "Stores app/page context information that helps TikTok attribute events correctly (e.g., which pixel, which page instance)."
  },
  {
    name: "tt_pixel_session_index",
    vendor: "TikTok Pixel",
    category: "advertisement",
    wildcard: false,
    description: "Keeps track of the number of sessions initiated by the same visitor, linked to the TikTok Pixel ID. Supports event de-duplication and session attribution."
  },
  {
    name: "tt_sessionId",
    vendor: "TikTok Pixel",
    category: "advertisement",
    wildcard: false,
    description: "Holds a unique ID for the current browsing session. Used to group multiple events (page views, clicks) into one session for attribution."
  },
  {
    name: "ttclid",
    vendor: "TikTok Pixel",
    category: "advertisement",
    wildcard: false,
    description: "Stores the TikTok Click ID when a user arrives on the site via a TikTok ad. Used for conversion attribution to link ad clicks with on-site actions."
  },
  {
    name: "ttcsid",
    vendor: "TikTok Pixel",
    category: "advertisement",
    wildcard: false,
    description: "Used to recognize and match events for TikTok advertising campaigns; helps with conversion attribution and ad optimization."
  },
  {
    name: "ttcsid_",
    vendor: "TikTok Pixel",
    category: "advertisement",
    wildcard: true,
    description: "Used to recognize and match events for TikTok advertising campaigns; helps with conversion attribution and ad optimization."
  },
  {
    name: "tTDe",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the site\u2019s carousel component to remember browser capabilities"
  },
  {
    name: "tTDu",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the site\u2019s carousel component to remember browser capabilities"
  },
  {
    name: "tTE",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the site\u2019s carousel component to remember browser capabilities"
  },
  {
    name: "tTf",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Set by the site\u2019s carousel component to remember browser capabilities"
  },
  {
    name: "ttwid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "TikTok web identifier cookie storing a unique user identifier for the TikTok web platform."
  },
  {
    name: "tuid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a temporary or tracking user identifier for analytics purposes."
  },
  {
    name: "tuuid",
    vendor: "Bidswitch",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is mainly set by bidswitch.net to make advertising messages more relevant to the website visitor."
  },
  {
    name: "tuuid_lu",
    vendor: "Bidswitch",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is usually provided by bidswitch.net and is used for advertising purposes."
  },
  {
    name: "tv_UICR",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a UI configuration reference for television or streaming platform personalization."
  },
  {
    name: "tve_leads_unique",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Thrive Leads WordPress plugin cookie preventing duplicate lead form submissions."
  },
  {
    name: "tvid",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Presents the user with relevant content and advertisement. The service is provided by third-party advertisement hubs, which facilitate real-time bidding for advertisers."
  },
  {
    name: "tz",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user detected timezone for time-based content and scheduling."
  },
  {
    name: "u",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Generic short-form unique user identifier cookie for analytics or personalization."
  },
  {
    name: "u_sclid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a site click ID for cross-site attribution from paid campaigns."
  },
  {
    name: "u_sclid_r",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a referral site click ID for cross-site attribution tracking."
  },
  {
    name: "u_scsid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a site click session ID for session-level paid campaign attribution."
  },
  {
    name: "u_scsid_r",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a referral site click session ID for session attribution tracking."
  },
  {
    name: "ub-emb-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Userback embedded feedback widget cookie storing widget state and session data."
  },
  {
    name: "ubwc",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Userback widget cookie storing widget configuration and user interaction data."
  },
  {
    name: "uc_session",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Used by Dropbox for determining whether the user has accepted the cookie consent box."
  },
  {
    name: "uc_settings",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "uc_ui_version",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "uc_user_country",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "uc_user_interaction",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "ucData",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "ucString",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "udid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "uesign",
    vendor: "Zoho SalesIQ",
    category: "analytics",
    wildcard: false,
    description: "Set by Zoho SalesIQ to store an encrypted session signature. This cookie helps identify visitors securely, maintain their chat session, and support tracking of interactions on the website."
  },
  {
    name: "ufvd",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a unique fingerprint visitor ID for browser fingerprinting-based tracking."
  },
  {
    name: "uid",
    vendor: "AddThis",
    category: "analytics",
    wildcard: false,
    description: "This cookie is one of the cookies used to track usage of the Addthis.com service. It allows a user to share a webpage with many social sites."
  },
  {
    name: "uid-bp-",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Advertising cookie used for ad targeting, retargeting, and campaign attribution."
  },
  {
    name: "uids",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Advertising cookie used for ad targeting, retargeting, and campaign attribution."
  },
  {
    name: "uncode_privacy[consent_types]",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user's consent type selections for the Uncode theme privacy settings."
  },
  {
    name: "uncodeAI.css",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Used by Adaptive Image system to calculate the correct adaptive images."
  },
  {
    name: "uncodeAI.images",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Used by Adaptive Image system to calculate the correct adaptive images."
  },
  {
    name: "uncodeAI.screen",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Used by Adaptive Image system to calculate the correct adaptive images."
  },
  {
    name: "unifiedScriptVerified",
    vendor: "ZoomInfo",
    category: "analytics",
    wildcard: false,
    description: "Verifies that a specific script or code has been successfully executed or loaded"
  },
  {
    name: "unique_id",
    vendor: "POWR",
    category: "analytics",
    wildcard: false,
    description: "Set by POWR website plugins to assign a unique visitor identifier. This helps the plugin remember interactions (such as form entries or widget usage) and ensures the plugin works correctly across visits."
  },
  {
    name: "used_ad",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records whether the user has interacted with an advertisement during the session."
  },
  {
    name: "user_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the authenticated user's unique identifier for personalization purposes."
  },
  {
    name: "userconsent",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user's cookie consent preferences and accepted policies."
  },
  {
    name: "userId",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the user's unique identifier for session management and personalization."
  },
  {
    name: "UserID1",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Used to target ads by registering the user's movements across websites"
  },
  {
    name: "UserMatchHistory",
    vendor: "LinkedIn Insight",
    category: "advertisement",
    wildcard: false,
    description: "Contains a unique identifier used by LinkedIn to determine that two distinct hits belong to the same user across browsing sessions."
  },
  {
    name: "userReferer",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Is used to measure the efficiency of their marketing by determining how the user accessed the website."
  },
  {
    name: "UserSettings",
    vendor: "eviivo",
    category: "necessary",
    wildcard: false,
    description: "Used to store user preferences like currency and language."
  },
  {
    name: "usprivacy",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Stores a visitor\u2019s privacy preferences under the U.S. Privacy and CCPA frameworks."
  },
  {
    name: "utm_campaign",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Analytics cookie tracking visitor behavior and site usage statistics."
  },
  {
    name: "utm_medium",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "utm_source",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "Analytics cookie tracking visitor behavior and site usage statistics."
  },
  {
    name: "utsdb",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores UTM source data backup for attribution tracking across page loads."
  },
  {
    name: "uuid",
    vendor: "MediaMath",
    category: "advertisement",
    wildcard: false,
    description: "MediaMath uses this cookie to identify a unique visitor. It is used to optimize ad relevance by collecting visitor data from multiple websites. It does not contain information that is reasonably linkable to an identifiable person."
  },
  {
    name: "uuid2",
    vendor: "AppNexus",
    category: "advertisement",
    wildcard: false,
    description: "This cookie contains a unique randomly-generated value that enables AppNexus to distinguish browsers and devices. This information is used by clients to select advertisements for delivery by the Platform, and to measure the performance of, and attribute payment for, those advertisements."
  },
  {
    name: "uvc",
    vendor: "AddThis",
    category: "analytics",
    wildcard: false,
    description: "This cookie is one of the cookies used to track usage of the Addthis.com service. It allows a user to share a webpage with many social sites."
  },
  {
    name: "uw-icon-locales",
    vendor: "UserWay (accessibility widget)",
    category: "performance",
    wildcard: false,
    description: "Used by UserWay to store accessibility preferences, language settings, and widget configuration."
  },
  {
    name: "uw-tunings",
    vendor: "UserWay (accessibility widget)",
    category: "performance",
    wildcard: false,
    description: "Used by UserWay to store accessibility preferences, language settings, and widget configuration."
  },
  {
    name: "uw-tunings-checksum",
    vendor: "UserWay (accessibility widget)",
    category: "performance",
    wildcard: false,
    description: "Used by UserWay to store accessibility preferences, language settings, and widget configuration."
  },
  {
    name: "uw-uid",
    vendor: "UserWay (accessibility widget)",
    category: "performance",
    wildcard: false,
    description: "Used by UserWay to store a pseudonymous identifier for the accessibility widget."
  },
  {
    name: "V",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Short-form visitor or version identifier cookie for analytics or feature flagging."
  },
  {
    name: "v2_contact_session_",
    vendor: "LeadConnector",
    category: "advertisement",
    wildcard: true,
    description: "Stores unique session ID for lead identification."
  },
  {
    name: "v2_history_",
    vendor: "LeadConnector",
    category: "advertisement",
    wildcard: true,
    description: "Tracks page visits and time spent for attribution analysis."
  },
  {
    name: "v2_session_history_",
    vendor: "LeadConnector",
    category: "advertisement",
    wildcard: true,
    description: "Keeps a log of all session details for analysis."
  },
  {
    name: "v3_first_session_event_",
    vendor: "LeadConnector",
    category: "advertisement",
    wildcard: true,
    description: "Tracks the first session landing details like referrer and landing page."
  },
  {
    name: "VID",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a visitor identifier for analytics or ad targeting platforms."
  },
  {
    name: "viewer_token",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Stores a token for authenticating access to protected video or content streams."
  },
  {
    name: "visid_incap_",
    vendor: "Unknown",
    category: "necessary",
    wildcard: true,
    description: "Incapsula DDoS Protectiona and Web Application Firewall: cookie for linking certain sessions to a specific visitor (visitor representing a specific computer). In order to identify clients that have already visited Incapsula."
  },
  {
    name: "visited",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Records whether the user has previously visited the site or a specific page."
  },
  {
    name: "Visitor",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a visitor identifier for tracking return visits and user behavior."
  },
  {
    name: "visitor_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a unique visitor identifier for CRM or analytics platforms."
  },
  {
    name: "visitor_id944003",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Pardot/Salesforce cookie storing a unique visitor identifier for marketing automation."
  },
  {
    name: "visitor_id944003-hash",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Pardot/Salesforce cookie storing the hash of the visitor identifier for security verification."
  },
  {
    name: "VISITOR_INFO1_LIVE",
    vendor: "YouTube",
    category: "advertisement",
    wildcard: false,
    description: "Set by YouTube and used for various purposes, including analytical and advertising."
  },
  {
    name: "VISITOR_PRIVACY_METADATA",
    vendor: "YouTube",
    category: "advertisement",
    wildcard: false,
    description: "Used by YouTube to store the user\u2019s privacy and consent settings for embedded videos. It helps ensure that user privacy choices (like consent for personalized ads or tracking) are respected when watching embedded YouTube content."
  },
  {
    name: "visitor-id",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "This cookie serves an analytical purpose by gathering information about the visitor. It is set by media.net."
  },
  {
    name: "VisitorId",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a unique visitor identifier for analytics and personalization."
  },
  {
    name: "vmuid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a visitor or member unique identifier for tracking purposes."
  },
  {
    name: "VP",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a visitor profile or version parameter for personalization."
  },
  {
    name: "vuid",
    vendor: "Vimeo",
    category: "performance",
    wildcard: false,
    description: "These cookies are used by the Vimeo video player on websites."
  },
  {
    name: "vwo_apm_sent",
    vendor: "Unknown",
    category: "analytics",
    wildcard: false,
    description: "VWO Application Performance Monitoring cookie tracking whether APM data was sent."
  },
  {
    name: "vwoSn",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "VWO session number cookie tracking the visitor's session count for A/B experiments."
  },
  {
    name: "wc_cart_created",
    vendor: "WooCommerce",
    category: "necessary",
    wildcard: false,
    description: "Set by WooCommerce to store performed actions on the website."
  },
  {
    name: "wc_cart_hash_",
    vendor: "Unknown",
    category: "necessary",
    wildcard: true,
    description: "This cookie is used by WooCommerce to remember which products you've added to your cart."
  },
  {
    name: "wc_fragments_",
    vendor: "Unknown",
    category: "necessary",
    wildcard: true,
    description: "Used by WooCommerce"
  },
  {
    name: "wc_visitor",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "WooCommerce cookie identifying the current visitor for cart and order management."
  },
  {
    name: "wcboost_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "WCBoost WooCommerce plugin cookie for performance and feature enhancement tracking."
  },
  {
    name: "wcml_client_currency",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "WooCommerce Multilingual cookie storing the user's selected currency preference."
  },
  {
    name: "wcml_client_currency_language",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "WooCommerce Multilingual cookie storing the language associated with the selected currency."
  },
  {
    name: "webp_lossless_supported",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores whether the visitor's browser supports lossless WebP images for format selection."
  },
  {
    name: "webp_lossy_supported",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores whether the visitor's browser supports lossy WebP images for format selection."
  },
  {
    name: "website",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores a website identifier for multi-site platform session routing."
  },
  {
    name: "websitespring-xsrf",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "WebsiteSpring platform CSRF token cookie for protecting form submissions."
  },
  {
    name: "WeeblyDiceRollUser",
    vendor: "Weebly",
    category: "analytics",
    wildcard: false,
    description: "This cookie is set by Weebly and is used for analytical purposes."
  },
  {
    name: "wf_third_party_cookie",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Webflow cookie testing third-party cookie availability for cross-origin tracking."
  },
  {
    name: "wf-csrf",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Webflow CSRF token cookie for protecting form submissions from cross-site request forgery."
  },
  {
    name: "wf-csrf.sig",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Webflow CSRF token signature cookie for verifying CSRF token integrity."
  },
  {
    name: "WFESessionId",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Webflow Editor session cookie for managing authenticated editor sessions."
  },
  {
    name: "wfivefivec",
    vendor: "Roku",
    category: "advertisement",
    wildcard: false,
    description: "Set by Roku and is used for advertising purposes."
  },
  {
    name: "wg-translations",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Weglot translation cookie storing the user's language selection for site translation."
  },
  {
    name: "wg-translations-version",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Weglot translation cookie storing the version of translations currently loaded."
  },
  {
    name: "what-intent",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores detected user intent (mouse vs. keyboard) for accessibility improvements."
  },
  {
    name: "wires",
    vendor: "ProcessWire",
    category: "necessary",
    wildcard: false,
    description: "Processwire content management system session identifier. First-party session cookie, expires when the browser is closed."
  },
  {
    name: "wishlist_cleared_time",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores the timestamp when the user's wishlist was last cleared."
  },
  {
    name: "wistia",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Wistia video hosting cookie storing video player preferences and engagement data."
  },
  {
    name: "wistia-video-progress-",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Wistia video hosting cookie storing playback progress for video resume functionality."
  },
  {
    name: "WMF-Uniq",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Wikimedia Foundation cookie storing a unique visitor identifier for analytics."
  },
  {
    name: "woocommerce_cart_hash",
    vendor: "WooCommerce",
    category: "necessary",
    wildcard: false,
    description: "Helps WooCommerce determine when cart contents/data changes."
  },
  {
    name: "woocommerce_items_in_cart",
    vendor: "WooCommerce",
    category: "necessary",
    wildcard: false,
    description: "Used by WooCommerce to keep track of cart data"
  },
  {
    name: "woocommerce_recently_viewed",
    vendor: "WooCommerce",
    category: "necessary",
    wildcard: false,
    description: "Set by WooCommerce to store performed actions on the website"
  },
  {
    name: "woodmart_recently_viewed_products",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Woodmart theme cookie storing the list of recently viewed products for display."
  },
  {
    name: "woodmart_wishlist_count",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Woodmart theme cookie storing the count of items in the user's wishlist."
  },
  {
    name: "woosw_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "WooCommerce Smart Wishlist plugin cookie storing the user wishlist session data."
  },
  {
    name: "woosw_key",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "WooCommerce Smart Wishlist cookie storing the unique key for the user's wishlist."
  },
  {
    name: "wordpress_test_cookie",
    vendor: "Wordpress",
    category: "necessary",
    wildcard: false,
    description: "Used by Wordpress to check if the cookies are enabled on the browser."
  },
  {
    name: "workingProduct-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Cookie used by the website for session management or feature operation."
  },
  {
    name: "wp_consent_functional",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "WordPress Consent API cookie tracking user's consent for functional cookies."
  },
  {
    name: "wp_consent_marketing",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "WordPress Consent API cookie tracking user's consent for marketing cookies."
  },
  {
    name: "wp_consent_preferences",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "WordPress Consent API cookie tracking user's consent for preference cookies."
  },
  {
    name: "wp_consent_statistics",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "WordPress Consent API cookie tracking user's consent for statistics cookies."
  },
  {
    name: "wp_consent_statistics-anonymous",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "WordPress Consent API cookie for anonymous statistics consent tracking."
  },
  {
    name: "wp_ga4_customerGroup",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "WordPress Google Analytics 4 cookie storing customer group segmentation data."
  },
  {
    name: "WP_SESSION_COOKIE",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "WordPress session cookie storing user session data for the current visit."
  },
  {
    name: "wp_woocommerce_session_",
    vendor: "WooCommerce",
    category: "necessary",
    wildcard: true,
    description: "Used by WooCommerce and contains unique code for each customer so that it knows where to find the cart data in the database for each customer"
  },
  {
    name: "wp-api-schema-model",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "WordPress REST API cookie caching schema model data for API requests."
  },
  {
    name: "wp-wpml_current_language",
    vendor: "WordPress Multilingual",
    category: "performance",
    wildcard: false,
    description: "This cookie is set by WPML and it stores the current language settings."
  },
  {
    name: "wpcf7_guest_user_id",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Contact Form 7 WordPress plugin cookie identifying guest users submitting forms."
  },
  {
    name: "wpEmojiSettingsSupports",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "This cookie is utilized to enable emoji support on pages using Wordpress."
  },
  {
    name: "wpml_browser_redirect_test",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Tests if cookies are enabled. This cookie is enabled for all site visitors if you use the Browser language redirect feature."
  },
  {
    name: "wpr_guest_token",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "WP Rocket plugin cookie storing a token for identifying non-logged-in guest users."
  },
  {
    name: "wpvp1",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "WordPress video player cookie storing playback preferences for embedded videos."
  },
  {
    name: "wrapped-product-",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Stores gift wrap selection state for products in e-commerce checkout."
  },
  {
    name: "X-AB",
    vendor: "Snapchat",
    category: "advertisement",
    wildcard: false,
    description: "Set by Snapchat Ads (sc-static.net) to support A/B testing and personalization. This cookie helps measure ad performance and decide which ad or feature variation is shown to the visitor."
  },
  {
    name: "X-Magento-Vary",
    vendor: "Unknown",
    category: "performance",
    wildcard: false,
    description: "Used by Magento for configuration setting that improves performance when using Varnish static content caching."
  },
  {
    name: "x-ms-routing-name",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "Registers which server-cluster is serving the visitor. This is used in context with load balancing, in order to optimize user experience."
  },
  {
    name: "x-pp-s",
    vendor: "Paypal",
    category: "necessary",
    wildcard: false,
    description: "Used by PayPal for secure payment services"
  },
  {
    name: "XANDR_PANID",
    vendor: "Unknown",
    category: "advertisement",
    wildcard: false,
    description: "Used by Xandr to store a unique randomly generated value that enables the Platform to distinguish browsers and devices."
  },
  {
    name: "XSRF-TOKEN",
    vendor: "Unknown",
    category: "necessary",
    wildcard: false,
    description: "This cookie is used to protect the website and users from cross-site request forgery (CSRF/XSRF) attacks."
  },
  {
    name: "yabs-sid",
    vendor: "Yandex.Metrika",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is used by Yandex to record data on the behavior of the website visitor on the Website."
  },
  {
    name: "yandexuid",
    vendor: "Yandex.Metrika",
    category: "analytics",
    wildcard: false,
    description: "This cookie is used by Yandex.Metrica to identify the users. This cookie collects\r\ninformation about how visitors use the website. This information is used for internal analysis and site optimisation."
  },
  {
    name: "yashr",
    vendor: "Yandex Advertising Services",
    category: "advertisement",
    wildcard: false,
    description: "Uused to track user behavior across websites for profiling and delivering targeted advertising."
  },
  {
    name: "yith_wcwl_session_",
    vendor: "Unknown",
    category: "other",
    wildcard: true,
    description: "YITH WooCommerce Wishlist plugin cookie storing the user wishlist session."
  },
  {
    name: "ymex",
    vendor: "Yandex.Metrika",
    category: "advertisement",
    wildcard: false,
    description: "Registers data on visitors' website-behaviour. This is used for internal analysis and website optimization."
  },
  {
    name: "yotpo_pixel",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Yotpo reviews and UGC platform cookie storing pixel tracking data."
  },
  {
    name: "yp",
    vendor: "Yandex.Metrika",
    category: "analytics",
    wildcard: false,
    description: "Used by Yandex.Metrica for website analytics, helping to track how visitors use the site to improve performance."
  },
  {
    name: "YSC",
    vendor: "YouTube",
    category: "advertisement",
    wildcard: false,
    description: "This cookie is set by YouTube video service on pages with YouTube embedded videos to track views."
  },
  {
    name: "yuidss",
    vendor: "Yandex.Metrika",
    category: "advertisement",
    wildcard: false,
    description: "Used by Yandex for identifying site users"
  },
  {
    name: "zabUserId",
    vendor: "Zoho PageSense",
    category: "analytics",
    wildcard: false,
    description: "Used by Zoho PageSense for identifying individual visitors along with the status of new and returning visitors."
  },
  {
    name: "ZD-buid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Zendesk cookie storing a browser unique identifier for support widget sessions."
  },
  {
    name: "ZD-store",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Zendesk cookie storing widget data for the support chat and help center."
  },
  {
    name: "ZD-suid",
    vendor: "Unknown",
    category: "other",
    wildcard: false,
    description: "Zendesk cookie storing a session unique identifier for the support widget."
  },
  {
    name: "zfccn",
    vendor: "Zoho Campaigns",
    category: "advertisement",
    wildcard: false,
    description: "Used by Zoho Campaigns when a request is sent to campaigns."
  },
  {
    name: "zft-sdc",
    vendor: "Zoho Marketing Automation",
    category: "advertisement",
    wildcard: false,
    description: "Used by Zoho Marketing automation when a visitor visits a website containing tracking code."
  },
  {
    name: "ziwsSession",
    vendor: "ZoomInfo",
    category: "analytics",
    wildcard: false,
    description: "This cookie is used by ZoomInfo to manage the current script or browser session. It helps coordinate requests, maintain session context, and ensure proper execution of ZoomInfo services during a user\u2019s visit."
  },
  {
    name: "ziwsSessionId",
    vendor: "ZoomInfo",
    category: "analytics",
    wildcard: false,
    description: "This cookie is used by ZoomInfo to manage the current script or browser session. It helps coordinate requests, maintain session context, and ensure proper execution of ZoomInfo services during a user\u2019s visit."
  },
  {
    name: "zps-ft-details",
    vendor: "Zoho PageSense",
    category: "analytics",
    wildcard: false,
    description: "Used by Zoho PageSense to collect data on the user\u2019s navigation and behavior on the website."
  },
  {
    name: "zps-ft-pghitType-details",
    vendor: "Zoho PageSense",
    category: "analytics",
    wildcard: false,
    description: "Used by Zoho PageSense to collect data on the user\u2019s navigation and behavior on the website."
  },
  {
    name: "zps-tgr-dts",
    vendor: "Zoho PageSense",
    category: "analytics",
    wildcard: false,
    description: "Used by Zoho PageSense for activating your experiment based on a given trigger condition."
  }
];
var cookies = cookies_default;

// src/categorise.ts
var exact = /* @__PURE__ */ new Map();
var prefixes = [];
for (const entry of cookies) {
  const match = { category: entry.category, vendor: entry.vendor === "Unknown" ? null : entry.vendor, known: true };
  const name = entry.name.toLowerCase();
  if (entry.wildcard) prefixes.push({ prefix: name, match });
  else if (!exact.has(name)) exact.set(name, match);
}
prefixes.sort((a, b) => b.prefix.length - a.prefix.length);
var UNKNOWN = { category: "other", vendor: null, known: false };
var categorise = (name) => {
  const lower = name.toLowerCase();
  const found = exact.get(lower);
  if (found) return found;
  for (const { prefix, match } of prefixes) {
    if (lower.startsWith(prefix) && lower.length > prefix.length) return match;
  }
  return UNKNOWN;
};

// src/engine.ts
import { spawnSync } from "node:child_process";
import { existsSync as existsSync2, mkdirSync, readFileSync } from "node:fs";
import { join as join2 } from "node:path";
var ENGINE_VERSION = "1.3.0";
var engineDir = (dataDir) => join2(dataDir, "engine");
var enginePackageJson = (dataDir) => join2(engineDir(dataDir), "node_modules", "@cookiepal-oss", "cli", "package.json");
var engineEntry = (dataDir) => join2(engineDir(dataDir), "node_modules", "@cookiepal-oss", "cli", "dist", "engine.js");
var installedVersion = (dataDir) => {
  try {
    const parsed = JSON.parse(readFileSync(enginePackageJson(dataDir), "utf8"));
    return typeof parsed === "object" && parsed !== null && typeof parsed.version === "string" ? parsed.version : null;
  } catch {
    return null;
  }
};
var ensureEngine = (dataDir) => {
  if (installedVersion(dataDir) === ENGINE_VERSION) return;
  if (!existsSync2(engineDir(dataDir))) mkdirSync(engineDir(dataDir), { recursive: true });
  const result = spawnSync(
    "npm",
    ["install", "--prefix", engineDir(dataDir), "--no-audit", "--no-fund", `@cookiepal-oss/cli@${ENGINE_VERSION}`],
    {
      env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: "1" },
      encoding: "utf8"
    }
  );
  if (result.error) {
    throw new CheckError(`Could not run npm to install the crawl engine: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const lastLines = (result.stderr ?? "").trim().split("\n").slice(-5).join("\n");
    throw new CheckError(
      `Installing the crawl engine failed.${lastLines ? ` ${lastLines}` : ""} Check this machine has npm and a network connection, then try again.`
    );
  }
  if (installedVersion(dataDir) !== ENGINE_VERSION) {
    throw new CheckError("The crawl engine did not install correctly. Try again.");
  }
};

// src/savedPlans.ts
import { mkdirSync as mkdirSync2, readdirSync, readFileSync as readFileSync2, rmSync as rmSync2, statSync, writeFileSync } from "node:fs";
import { join as join3 } from "node:path";
var SCANS = "scans";
var SCAN_PROGRESS = "scan-progress";
var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
var MAX_AGE_MS = 30 * 60 * 1e3;
var isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var isExpired = (path) => Date.now() - statSync(path).mtimeMs > MAX_AGE_MS;
var liveFiles = (dir) => {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  const live = [];
  for (const name of names) {
    const path = join3(dir, name);
    try {
      if (isExpired(path)) rmSync2(path, { recursive: true, force: true });
      else live.push({ path, mtime: statSync(path).mtimeMs });
    } catch {
    }
  }
  return live.sort((a, b) => b.mtime - a.mtime).map(({ path }) => path);
};
var write = (dir, name, value) => {
  mkdirSync2(dir, { recursive: true });
  liveFiles(dir);
  writeFileSync(join3(dir, name), JSON.stringify(value), { mode: 384 });
};
var isScanId = (value) => typeof value === "string" && UUID.test(value);
var readScan = (dataDir, scanId) => {
  if (!isScanId(scanId)) return null;
  const path = join3(dataDir, SCANS, `${scanId}.json`);
  try {
    if (isExpired(path)) {
      rmSync2(path, { force: true });
      return null;
    }
    const saved = JSON.parse(readFileSync2(path, "utf8"));
    if (!isRecord(saved)) return null;
    const { scanId: id, domainId, url, maxPages, savedAt } = saved;
    if (typeof id !== "string" || typeof domainId !== "string" || typeof url !== "string") return null;
    if (typeof maxPages !== "number" || typeof savedAt !== "number") return null;
    return { scanId: id, domainId, url, maxPages, savedAt };
  } catch {
    return null;
  }
};
var saveScanProgress = (dataDir, scanId, progress) => {
  if (!isScanId(scanId)) return false;
  write(join3(dataDir, SCAN_PROGRESS), `${scanId}.json`, { scanId, ...progress, savedAt: Date.now() });
  return true;
};

// src/scan.ts
var MAX_DEPTH = 3;
var CONCURRENCY = 3;
var run = async () => {
  const scanId = process.argv[2];
  const dataDir = process.env.COOKIEPAL_DATA_DIR || null;
  if (!scanId || !dataDir) return;
  const scan = readScan(dataDir, scanId);
  if (!scan) {
    saveScanProgress(dataDir, scanId, {
      status: "failed",
      error: "The scan could not be found. Start a new one with start_scan."
    });
    return;
  }
  const storageDir = `${dataDir}/crawl-storage/${scanId}`;
  try {
    ensureEngine(dataDir);
    saveScanProgress(dataDir, scanId, { status: "running", pagesVisited: 0 });
    const browserPath = findBrowser();
    if (!browserPath) {
      throw new CheckError(
        "No Chrome, Edge, Brave or Chromium was found. Install one, or set COOKIEPAL_BROWSER to its executable."
      );
    }
    process.env.PUPPETEER_EXECUTABLE_PATH = browserPath;
    const engineUrl = pathToFileURL(engineEntry(dataDir)).href;
    const { crawl } = await import(engineUrl);
    saveScanProgress(dataDir, scanId, { status: "running", pagesVisited: 0 });
    let pagesVisited = 0;
    const result = await crawl({
      url: scan.url,
      maxPages: scan.maxPages,
      maxDepth: MAX_DEPTH,
      concurrency: CONCURRENCY,
      storageDir,
      keepImages: true,
      markRequests: false,
      respectRobots: true,
      onPageCrawled: () => {
        pagesVisited += 1;
        saveScanProgress(dataDir, scanId, { status: "running", pagesVisited });
      }
    });
    if (result.startBlockedByRobots) {
      saveScanProgress(dataDir, scanId, {
        status: "blocked",
        blockedUrl: result.robotsBlocked[0] ?? scan.url
      });
      return;
    }
    const cookies2 = result.cookies.map((cookie) => {
      const { category, vendor } = categorise(cookie.name);
      return {
        name: cookie.name,
        domain: cookie.domain,
        path: cookie.path,
        duration: cookie.duration,
        category,
        ...vendor ? { description: vendor } : {}
      };
    });
    saveScanProgress(dataDir, scanId, {
      status: "done",
      pagesScanned: result.pagesVisited,
      cookies: cookies2,
      thirdPartyHosts: [],
      // A heuristic: the engine reports no truncation signal, so a site with exactly maxPages pages reads as truncated too.
      truncated: result.pagesVisited >= scan.maxPages
    });
  } catch (error) {
    saveScanProgress(dataDir, scanId, {
      status: "failed",
      error: error instanceof CheckError ? error.message : "The crawl could not be completed."
    });
  } finally {
    rmSync3(storageDir, { recursive: true, force: true });
  }
};
run();
