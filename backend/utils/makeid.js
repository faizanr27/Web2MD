export function makeId(length) {
  let num = '0123456789'
  let numLength = num.length
  let result = ''
  for(let i=0 ; i < length; i++){
    result += Math.floor(Math.random() * numLength )
  }
  return result
}
