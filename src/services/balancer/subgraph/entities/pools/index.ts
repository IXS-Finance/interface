import { configService } from 'services/config/config.service';
import { Pool } from 'services/pool/types';
import { Network } from 'lib/config/types';
import { PoolsQueryBuilder } from 'types/subgraph';
import {
  GraphQLArgs,
  GraphQLQuery,
  PoolsSubgraphRepository,
} from '@ixswap1/dex-v2-sdk';
import _ from 'lodash';
import Service from '../../balancer-subgraph.service';
import queryBuilder from './query';
import { getAliveSubgraphUrl } from 'lib/utils';

export default class Pools {
  service: Service;
  queryBuilder: PoolsQueryBuilder;
  lastQuery?: GraphQLQuery;
  repository?: PoolsSubgraphRepository;

  constructor(
    service: Service,
    _queryBuilder: PoolsQueryBuilder = queryBuilder
  ) {
    this.service = service;
    this.queryBuilder = _queryBuilder;
  }

  public async get(args: GraphQLArgs = {}, attrs: any = {}): Promise<Pool[]> {
    const query = this.queryBuilder(args, attrs);

    if (!this.repository || !_.isEqual(query, this.lastQuery)) {
      this.lastQuery = _.cloneDeep(query);
       const urls = configService.network.subgraphs.main

      if (urls.length === 0) {
        throw new Error('No subgraph URLs found')
      }

      const subgraphUrl = await getAliveSubgraphUrl(urls)

      this.repository = new PoolsSubgraphRepository({
        url: subgraphUrl,
        chainId: configService.network.chainId as Network,
        query: query,
      });
    }

    const pools = await this.repository.fetch({
      first: query.args.first,
      skip: query.args.skip,
    });

    return pools as Pool[];
  }

  get skip(): number {
    return this.repository ? this.repository.skip : 0;
  }
}
