import {connect} from "extendable-media-recorder-wav-encoder";
import {register} from 'extendable-media-recorder';

export function registerWav() {
  return connect().then(register).catch(console.info);
}