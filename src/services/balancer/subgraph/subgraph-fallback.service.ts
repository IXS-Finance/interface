import axios, { AxiosResponse } from 'axios';

import { configService } from 'services/config/config.service';
import { captureBalancerException } from 'lib/utils/errors';

const DECENTRALIZED_SUBGRAPH_URL = 'https://gateway.thegraph.com';

export class SubgraphFallbackService {
  private urlIndex = 0;

  public url = this.urls ? this.urls[this.urlIndex] : '';
  constructor(private readonly urls = configService.subgraphUrls || []) {
    console.log('urls', urls)
  }

  public async get(payload: unknown): Promise<AxiosResponse | void> {
    if (!payload) {
      throw new Error('Payload is required');
    }
    try {
      const currentUrl = this.urls[this.urlIndex];
      const response = await axios.post(currentUrl, payload);
      const errorMessage = response?.data.errors?.message;
      if (errorMessage) {
        throw new Error(errorMessage);
      }
      return response;
    } catch (error) {
      // Capture exception only with decentralized url
      if (this.url.startsWith(DECENTRALIZED_SUBGRAPH_URL)) {
        captureBalancerException({
          error,
          msgPrefix: `GraphQL request to [${
            this.url
          }] failed with message: ${(error as Error)?.message}`,
          context: {
            extra: {
              Payload: `${JSON.stringify(payload)}`,
            },
          },
        });
      }

      if (this.urlIndex + 1 === this.urls.length) {
        throw error;
      }

      this.incrementUrlIndex();
      return this.get(payload);
    }
  }

  private incrementUrlIndex(): void {
    this.urlIndex += 1;
  }
}

export const subgraphFallbackService = new SubgraphFallbackService();
