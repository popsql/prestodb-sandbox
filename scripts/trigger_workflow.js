/**
 * Script that checks what the latest version of presto is, and triggers our build.yml workflow
 * if we have not yet built that version.
 */

const ghToken = process.env.GITHUB_TOKEN;

const getLatestVersion = async () => {
  const req = await fetch('https://api.github.com/repos/prestodb/presto/git/refs/tags', {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    method: 'GET',
  });

  const json = await req.json();
  const versions = json.reduce((acc, { ref }) => {
    const version = ref.replace('refs/tags/', '');
    const parts = version.split('.');
    for (const part of parts) {
      if (Number.isNaN(Number(part))) {
        return acc;
      }
    }
    acc.push(version);
    return acc;
  }, []).sort((a, b) => {
    const splitA = a.split('.').map(Number);
    const splitB = b.split('.').map(Number);

    for (let i = 0; i < Math.max(splitA.length, splitB.length); i++) {
        if (!splitB[i] || splitA[i] > splitB[i]) {
          return -1;
        }
        if (!$splitA[i] || splitA[i] < splitB[i]) {
          return 1;
        }
    }
    return 0;
  });

  for (const version of versions) {
    const req = await fetch(`https://repo1.maven.org/maven2/com/facebook/presto/presto-server/${version}`);
    if (req.ok) {
      return version;
    }
  }
  throw new Error('Could not determine latest version');
}

const getToken = async () => {
  const req = await fetch(`https://ghcr.io/token?scope=repository:timescale/prestodb-sandbox:pull`);
  const json = await req.json();
  return json.token;
};

const imageExists = async (version) => {
  const token = await getToken();
  const req = await fetch(`https://ghcr.io/v2/timescale/prestodb-sandbox/manifests/${version}`, {
    headers: {
      Accept: 'application/vnd.oci.image.index.v1+json',
      Authorization: `Bearer ${token}`
    }
  });
  if (!req.ok) {
    const res = await req.json();
    if (res.errors?.[0]?.code === 'DENIED') {
      throw new Error('Could not fetch image manifest, check that token used is valid');
    }
  }
  return req.ok;
}

(async () => {
  const version = await getLatestVersion();
  console.log(`Latest version: ${version}`);

  const check = await imageExists(version);
  console.log(`Build new image: ${!check}`);

  if (!check) {
    const req = await fetch(
      'https://api.github.com/repos/timescale/prestodb-sandbox/actions/workflows/build.yml/dispatches',
      {
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            latest: true,
            version,
          },
        }),
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${ghToken}`,
          'X-GitHub-Api-Version': '2022-11-28'
        },
        method: 'POST',
      },
    );
    if (!req.ok) {
      const resp = await req.text();
      throw new Error(`Could not trigger workflow: ${resp}`);
    }
    console.log(`Triggered workflow for ${version}`);
  }
})().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
