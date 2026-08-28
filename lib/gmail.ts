import crypto from 'crypto';
import { google } from 'googleapis';
import { oauthClient } from './oauth';
function base64Url(input: Buffer | string){return Buffer.from(input).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'')}
function escapeHeader(v:string){return v.replace(/[\r\n]/g,' ').trim()}
function wrapBase64(s:string){return s.match(/.{1,76}/g)?.join('\r\n')??s}
function encodeSubject(v:string){const clean=escapeHeader(v);return /^[\x00-\x7F]*$/.test(clean)?clean:`=?UTF-8?B?${Buffer.from(clean,'utf8').toString('base64')}?=`}
export function gmailFor(refreshToken:string){const auth=oauthClient();auth.setCredentials({refresh_token:refreshToken});return google.gmail({version:'v1',auth})}
export async function sendEmail(args:{refreshToken:string;to:string;subject:string;html:string;attachment?:{filename:string;contentType:string;data:string}}){
 const gmail=gmailFor(args.refreshToken); const headers=[`To: ${escapeHeader(args.to)}`,`Subject: ${encodeSubject(args.subject)}`,'MIME-Version: 1.0']; let mime:string;
 if(args.attachment){const b=`bulkmailer_${crypto.randomUUID()}`;headers.push(`Content-Type: multipart/mixed; boundary="${b}"`);mime=[...headers,'',`--${b}`,'Content-Type: text/html; charset="UTF-8"','Content-Transfer-Encoding: 8bit','',args.html,'',`--${b}`,`Content-Type: ${escapeHeader(args.attachment.contentType)}; name="${escapeHeader(args.attachment.filename)}"`,'Content-Transfer-Encoding: base64',`Content-Disposition: attachment; filename="${escapeHeader(args.attachment.filename)}"`,'',wrapBase64(args.attachment.data.replace(/^data:[^;]+;base64,/,'')||''),'',`--${b}--`,''].join('\r\n')}else{headers.push('Content-Type: text/html; charset="UTF-8"');mime=[...headers,'',args.html,''].join('\r\n')}
 const res=await gmail.users.messages.send({userId:'me',requestBody:{raw:base64Url(mime)}});return res.data.id;
}
