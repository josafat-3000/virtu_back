import axios from 'axios';
import crypto from 'crypto';

const md5 = (data) => crypto.createHash('md5').update(data).digest('hex');

export async function sendDigestPost({ username, password, method, uri, url, bodyData }) {
  try {
    console.log('Obteniendo challenge...');

    const response = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json'
      },
      data: bodyData,
      validateStatus: () => true, // Acepta 401
    });

    const authHeader = response.headers['www-authenticate'];
    if (!authHeader || !authHeader.startsWith('Digest ')) {
      throw new Error('No se recibió Digest Auth del servidor');
    }

    const params = {};
    authHeader
      .substring(7)
      .split(', ')
      .forEach(part => {
        const [key, value] = part.split('=');
        params[key] = value.replace(/"/g, '');
      });

    const ha1 = md5(`${username}:${params.realm}:${password}`);
    const ha2 = md5(`${method}:${uri}`);
    const nonceCount = '00000001';
    const cnonce = crypto.randomBytes(16).toString('hex');

    const responseDigest = md5(
      `${ha1}:${params.nonce}:${nonceCount}:${cnonce}:${params.qop}:${ha2}`
    );

    const authorization = `Digest username="${username}", realm="${params.realm}", nonce="${params.nonce}", uri="${uri}", qop=${params.qop}, nc=${nonceCount}, cnonce="${cnonce}", response="${responseDigest}", opaque="${params.opaque}"`;

    console.log('Challenge obtenido, enviando POST con autenticación...');

    const finalResponse = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization
      },
      data: bodyData,
    });

    return finalResponse.data;

  } catch (error) {
    console.error('Error en Digest POST:', error.message);
    throw error;
  }
}
