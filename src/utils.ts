import {
  GenerateHighLevelErrorOpts,
  GenerateLowLevelErrorOpts,
  HighLevelErrorInternal,
  HLDefs,
  KeyOfStr,
  LLDefs,
  LowLevelErrorInternal
} from './interfaces'

/**
 * For a given set of error definitions, generate the className and code based on the property name.
 * - className is generated as PascalCase. For example 'INTERNAL_ERROR' -> 'InternalError'.
 * - code is the name of the property name
 */
export function generateHighLevelErrors<
  HLErrors extends HLDefs<KeyOfStr<HLErrors>>,
  HLInternal extends HighLevelErrorInternal
> (
  errorDefs: Record<keyof HLErrors, Partial<HLInternal>>,
  opts: GenerateHighLevelErrorOpts = {}
): HLErrors {
  return (Object.keys(errorDefs).reduce<
    Record<keyof HLErrors, Partial<HLInternal>>
  >((defs, errId) => {
    if (!opts.disableGenerateClassName && !defs[errId].className) {
      defs[errId].className = toPascalCase(errId)
    }

    if (!opts.disableGenerateCode && !defs[errId].code) {
      defs[errId].code = errId
    }

    return defs
  }, errorDefs) as unknown) as HLErrors
}

/**
 * For a given set of error definitions, generate the subCode based on the property name.
 * - subCode is the name of the property name
 */
export function generateLowLevelErrors<
  LLErrors extends LLDefs<KeyOfStr<LLErrors>>,
  LLInternal extends LowLevelErrorInternal
> (
  errorDefs: Record<keyof LLErrors, Partial<LLInternal>>,
  opts: GenerateLowLevelErrorOpts = {}
): LLErrors {
  return (Object.keys(errorDefs).reduce<
    Record<keyof LLErrors, Partial<LLInternal>>
  >((defs, errId) => {
    if (!opts.disableGenerateSubCode && !defs[errId].subCode) {
      defs[errId].subCode = errId
    }

    return defs
  }, errorDefs) as unknown) as LLErrors
}

// https://gist.github.com/jacks0n/e0bfb71a48c64fbbd71e5c6e956b17d7
function toPascalCase (str) {
  return str
    .match(/[a-z]+/gi)
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    })
    .join('')
}
