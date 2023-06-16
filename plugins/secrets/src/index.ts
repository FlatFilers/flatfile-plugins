import { FlatfileListener } from "@flatfile/listener";

export default function (listener: FlatfileListener) {
  listener.on("**", async (event) => {
    await event.cache.init("secrets", async () => {
      // return await api.secrets.list()

      const secretsResponse = await event.fetch(
        `https://platform.flatfile.com/api/v1/secrets`,
        {
          headers: {
            Authorization: `Bearer ${event._accessToken}`,
          },
        }
      );

      const SecretMap = new Map<string, string>();
      secretsResponse.data?.forEach((secret: any) => {
        SecretMap.set(secret.name, secret.value);
      });
      return SecretMap;
    });
  });
}
