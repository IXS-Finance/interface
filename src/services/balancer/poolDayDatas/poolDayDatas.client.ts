import axios from 'axios'
import { jsonToGraphQLQuery } from 'json-to-graphql-query'
import { configService } from 'services/config/config.service'

export class PoolDayDatasSubgraphClient {
  constructor(public readonly url: string = configService.network.subgraphs.main[0]) {}

  public async get(query: any) {
    try {
      if (!this.url) {
        return {
          poolDayDatas: [],
        }
      }
      const payload = this.payloadFor(query)
      const {
        data: { data },
      } = await axios.post(this.url, payload)
      return data
    } catch (error) {
      console.error('GaugesSubgraphClient request failed', error)
      throw error
    }
  }

  public payloadFor(query: any) {
    return { query: jsonToGraphQLQuery({ query }) }
  }
}

export const poolDayDatasSubgraphClient = new PoolDayDatasSubgraphClient()
