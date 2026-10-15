/**
 * Synthetic HTTP Toolkit HAR export modeled on the exporter's HAR profile
 * (httptoolkit-ui `src/model/http/har.ts`: HAR 1.2 log with pages, dual
 * params+text form postData, `_trailers`, aborted `status: 0` responses,
 * WebSocket `_webSocketMessages`/`_webSocketClose`, and log-level
 * `_tlsErrors` whose `cause` literals come from mockttp's
 * `TlsHandshakeFailure`). Creator version, timestamps, and addresses are
 * representative: no live HTTP Toolkit export has been run through REA yet.
 */
export const httpToolkitHar = () => ({
  log: {
    version: "1.2",
    creator: { name: "HTTP Toolkit", version: "1.24.0" },
    pages: httpToolkitHarPages(),
    entries: httpToolkitHarEntries(),
    _tlsErrors: httpToolkitHarTlsErrors(),
  },
});

const httpToolkitHarPages = () => [
  {
    id: "Android App",
    title: "Android App",
    startedDateTime: "2026-10-15T08:00:00.000+02:00",
    pageTimings: {},
  },
];

const httpToolkitHarEntries = () => [
  {
    pageref: "Android App",
    startedDateTime: "2026-10-15T08:00:01.500+02:00",
    time: 42.5,
    request: {
      method: "POST",
      url: "https://api.example.test/login?next=%2Fhome",
      httpVersion: "HTTP/1.1",
      cookies: [{ name: "session", value: "abc" }],
      headers: [
        { name: "Host", value: "api.example.test" },
        { name: "Content-Type", value: "application/x-www-form-urlencoded" },
      ],
      queryString: [{ name: "next", value: "/home" }],
      headersSize: -1,
      bodySize: 27,
      postData: {
        mimeType: "application/x-www-form-urlencoded",
        params: [
          { name: "user", value: "ada" },
          { name: "next", value: "/home" },
        ],
        text: "user=ada&next=%2Fhome",
      },
    },
    response: {
      status: 200,
      statusText: "OK",
      httpVersion: "HTTP/1.1",
      cookies: [],
      headers: [
        { name: "Content-Type", value: "application/json" },
        { name: "Set-Cookie", value: "token=xyz; Path=/; HttpOnly" },
      ],
      content: {
        size: 15,
        mimeType: "application/json",
        text: '{"ok":true}',
      },
      redirectURL: "",
      headersSize: -1,
      bodySize: 15,
    },
    cache: {},
    timings: {
      blocked: -1,
      dns: -1,
      connect: -1,
      ssl: -1,
      send: 1.5,
      wait: 38,
      receive: 3,
    },
  },
  {
    pageref: "Android App",
    startedDateTime: "2026-10-15T08:00:02.000+02:00",
    time: -1,
    request: {
      method: "GET",
      url: "https://api.example.test/stream",
      httpVersion: "HTTP/1.1",
      cookies: [],
      headers: [{ name: "Host", value: "api.example.test" }],
      _trailers: [{ name: "X-Checksum", value: "deadbeef" }],
      queryString: [],
      headersSize: -1,
      bodySize: 0,
      _requestBodyStatus: "discarded:not-decodable",
    },
    response: {
      status: 0,
      statusText: "",
      httpVersion: "",
      headers: [],
      cookies: [],
      content: { size: 0, mimeType: "application/x-unknown" },
      redirectURL: "",
      headersSize: -1,
      bodySize: -1,
    },
    cache: {},
    timings: {
      blocked: -1,
      dns: -1,
      connect: -1,
      ssl: -1,
      send: 0,
      wait: 0,
      receive: 0,
    },
  },
  {
    pageref: "Android App",
    startedDateTime: "2026-10-15T08:00:03.000+02:00",
    time: 120.25,
    request: {
      method: "GET",
      url: "https://api.example.test/socket",
      httpVersion: "HTTP/1.1",
      cookies: [],
      headers: [
        { name: "Host", value: "api.example.test" },
        { name: "Upgrade", value: "websocket" },
      ],
      queryString: [],
      headersSize: -1,
      bodySize: 0,
    },
    response: {
      status: 101,
      statusText: "Switching Protocols",
      httpVersion: "HTTP/1.1",
      cookies: [],
      headers: [{ name: "Upgrade", value: "websocket" }],
      content: {
        size: 0,
        mimeType: "application/octet-stream",
        comment: "Body discarded during HAR generation: longer than limit",
      },
      redirectURL: "",
      headersSize: -1,
      bodySize: 0,
    },
    cache: {},
    timings: {
      blocked: -1,
      dns: -1,
      connect: -1,
      ssl: -1,
      send: 1,
      wait: 10,
      receive: 0,
    },
    _resourceType: "websocket",
    _webSocketMessages: [
      { type: "send", opcode: 1, data: "hello", time: 1720.5 },
      { type: "receive", opcode: 2, data: "aGk=", time: 1721.75 },
    ],
    _webSocketClose: { code: 1000, reason: "done" },
  },
];

const httpToolkitHarTlsErrors = () => [
  {
    startedDateTime: "2026-10-15T08:00:04.000+02:00",
    time: 12.5,
    hostname: "pinned.example.test",
    cause: "cert-rejected",
    clientIPAddress: "192.0.2.10",
    clientPort: 51234,
    tlsMetadata: { sniHostname: "pinned.example.test" },
  },
];
