const doh = 'https://dns.google/dns-query'
const dohjson = 'https://dns.google/dns-query'
const contype = 'application/dns-message'
const jstontype = 'application/dns-json'
const r404 = new Response(null, {status: 404});

export default async function handler(request) {
    // when res is a Promise<Response>, it reduces billed wall-time
    // blog.cloudflare.com/workers-optimization-reduces-your-bill
    let res = r404;
    const { method, headers, url } = request
    const searchParams = new URL(url).searchParams
    if (method == 'GET' && searchParams.has('dns')) {
        res = fetch(doh + '?dns=' + searchParams.get('dns'), {
            method: 'GET',
            headers: {
                'Accept': contype,
            }
        });
    } else if (method === 'POST') {
        // streaming out the request body is optimal than awaiting on it
        const rostream = request.body;
        res = fetch(doh, {
            method: 'POST',
            headers: {
                'Accept': contype,
                'Content-Type': contype,
            },
            body: rostream,
        });
    } else if (method === 'GET' && headers.get('Accept') === jstontype) {
        const search = new URL(url).search
         res = fetch(dohjson + search, {
            method: 'GET',
            headers: {
                'Accept': jstontype,
            }
        });
    }
    return res;
}

export const config = {
  runtime: 'edge',
  dynamic: 'force-dynamic',
};
