---
layout: publish
title: 基于 openethereum 部署以太网节点
date: 2020-09-04 10:12:51
tags:
- Ethereum
- Docker-Compose
- Parity
- openethereum
categories: Notes
---

以太坊 Parity 客户端是除 Geth 之外使用量最高的一款以太坊客户端，使用的是 Rust 语言，现在改名为 [openethereum](https://github.com/openethereum/openethereum) 了。

```yaml
version: "3"

services:
  openethereum:
    image: openethereum/openethereum:v3.0.1
    container_name: openethereum
    restart: unless-stopped
    ports:
      - "30303:30303"
      - "30303:30303/udp"
      - "127.0.0.1:8545:8545"
      - "127.0.0.1:8546:8546"
    user: openethereum
    volumes:
      - ./chaindata:/chaindata
    stop_signal: SIGINT
    stop_grace_period: 2m
    command:
      - --no-download
      - --base-path=/chaindata
      - --jsonrpc-interface=all
      - --jsonrpc-cors=all
      - --ws-interface=all
      - --ws-origins=all
      - --no-ipc
      - --scale-verifiers
      - --num-verifiers=4
      - --pruning=fast
      - --pruning-memory=512
      - --cache-size-db=1024
      - --cache-size-blocks=128
      - --cache-size-queue=512
      - --cache-size-state=256
    logging:
      driver: "json-file"
      options:
        max-size: "2m"
        max-file: "10"
```
<escape><!-- more --></escape>

## 运行

首先需要创建 `chaindata` ，因为官方容器运行为用户为 `uid=1000` 和 `gid=1000` 的用户，所以需要设置好目录权限。

```bash
mkdir -p chaindata && chown -R 1000:1000 chaindata && docker-compose up -d
```

## 附录

CLI 参数

```bash
~ $ ./openethereum -h
OpenEthereum Client.
    By Wood/Paronyan/Kotewicz/Drwięga/Volf/Greeff
       Habermeier/Czaban/Gotchac/Redman/Nikolsky
       Schoedon/Tang/Adolfsson/Silva/Palm/Hirsz et al.
    Copyright 2015-2020 Parity Technologies (UK) Ltd.
    License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>.

parity [options]
parity [options] daemon <PID-FILE>
parity [options] account new
parity [options] account list
parity [options] account import <PATH>...
parity [options] wallet import <PATH>
parity [options] import --format=[FORMAT] [FILE]
parity [options] export blocks --format=[FORMAT] --from=[BLOCK] --to=[BLOCK] [FILE]
parity [options] export state [--no-storage] [--no-code] --min-balance=[WEI] --max-balance=[WEI] --at=[BLOCK]
    --format=[FORMAT] [FILE]
parity [options] signer new-token
parity [options] signer list
parity [options] signer sign [ID]
parity [options] signer reject <ID>
parity [options] snapshot --at=[BLOCK] <FILE>
parity [options] restore [FILE]
parity [options] tools hash <FILE>
parity [options] db kill
parity [options] db reset <NUM>
parity [options] export-hardcoded-sync
parity [options] dapp <PATH>

Operating Options:
    --no-download
        Normally new releases will be downloaded ready for updating. This disables it. Not recommended.

    --no-consensus
        Force the binary to run even if there are known issues regarding consensus. Not recommended.

    --light
        Experimental: run in light client mode. Light clients synchronize a bare minimum of data and fetch necessary
        data on-demand from the network. Much lower in storage, potentially higher in bandwidth. Has no effect with
        subcommands.

    --no-hardcoded-sync
        By default, if there is no existing database the light client will automatically jump to a block hardcoded in
        the chain's specifications. This disables this feature.

    --force-direct
        Run the originally installed version of Parity, ignoring any updates that have since been installed.

    --mode=[MODE]
        Set the operating mode. MODE can be one of: last - Uses the last-used mode, active if none; active - Parity
        continuously syncs the chain; passive - Parity syncs initially, then sleeps and wakes regularly to resync; dark
        - Parity syncs only when the JSON-RPC is active; offline - Parity doesn't sync. (default: last)

    --mode-timeout=[SECS]
        Specify the number of seconds before inactivity timeout occurs when mode is dark or passive (default: 300)

    --mode-alarm=[SECS]
        Specify the number of seconds before auto sleep reawake timeout occurs when mode is passive (default: 3600)

    --auto-update=[SET]
        Set a releases set to automatically update and install. SET can be one of: all - All updates in the our release
        track; critical - Only consensus/security updates; none - No updates will be auto-installed. (default: critical)

    --auto-update-delay=[NUM]
        Specify the maximum number of blocks used for randomly delaying updates. (default: 100)

    --auto-update-check-frequency=[NUM]
        Specify the number of blocks between each auto-update check. (default: 20)

    --release-track=[TRACK]
        Set which release track we should use for updates. TRACK can be one of: stable - Stable releases; nightly -
        Nightly releases (unstable); testing - Testing releases (do not use); current - Whatever track this executable
        was released on. (default: current)

    --chain=[CHAIN]
        Specify the blockchain type. CHAIN may be either a JSON chain specification file or ethereum, classic, classic-
        no-phoenix, poacore, xdai, volta, ewc, musicoin, ellaism, mix, callisto, ethercore, mordor, ropsten,
        kovan, rinkeby, goerli, kotti, poasokol, testnet, evantestcore, evancore or dev. (default: foundation)

    --keys-path=[PATH]
        Specify the path for JSON key files to be found (default: $BASE/keys)

    --identity=[NAME]
        Specify your node's name. (default:)

    -d, --base-path=[PATH]
        Specify the base data storage path.

    --db-path=[PATH]
        Specify the database directory path

Convenience Options:
    --unsafe-expose
        All servers will listen on external interfaces and will be remotely accessible. It's equivalent with setting the
        following: --[ws,jsonrpc,secretstore,stratum,dapps,secretstore-http]-interface=all --*-hosts=all    This option
        is UNSAFE and should be used with great care!

    -c, --config=[CONFIG]
        Specify a configuration. CONFIG may be either a configuration file or a preset: dev, insecure, dev-insecure,
        mining, or non-standard-ports. (default: $BASE/config.toml)

    --ports-shift=[SHIFT]
        Add SHIFT to all port numbers Parity is listening on. Includes network port and all servers (HTTP JSON-RPC,
        WebSockets JSON-RPC, SecretStore). (default: 0)

Account Options:
    --fast-unlock
        Use drastically faster unlocking mode. This setting causes raw secrets to be stored unprotected in memory, so
        use with care.

    --keys-iterations=[NUM]
        Specify the number of iterations to use when deriving key from the password (bigger is more secure) (default:
        10240)

    --accounts-refresh=[TIME]
        Specify the cache time of accounts read from disk. If you manage thousands of accounts set this to 0 to disable
        refresh. (default: 5)

    --unlock=[ACCOUNTS]
        Unlock ACCOUNTS for the duration of the execution. ACCOUNTS is a comma-delimited list of addresses.

    --enable-signing-queue=[BOOLEAN]
        Enables the signing queue for external transaction signing either via CLI or personal_unlockAccount, turned off
        by default. (default: false)

    --password=[FILE]...
        Provide a file containing a password for unlocking an account. Leading and trailing whitespace is trimmed.
        (default: [])

Private Transactions Options:
    --private-tx-enabled
        Enable private transactions.

    --private-state-offchain
        Store private state offchain (in the local DB).

    --private-signer=[ACCOUNT]
        Specify the account for signing public transaction created upon verified private transaction.

    --private-validators=[ACCOUNTS]
        Specify the accounts for validating private transactions. ACCOUNTS is a comma-delimited list of addresses.

    --private-account=[ACCOUNT]
        Specify the account for signing requests to secret store.

    --private-sstore-url=[URL]
        Specify secret store URL used for encrypting private transactions.

    --private-sstore-threshold=[NUM]
        Specify secret store threshold used for encrypting private transactions.

    --private-passwords=[FILE]...
        Provide a file containing passwords for unlocking accounts (signer, private account, validators).

UI Options:
    --ui-path=[PATH]
        Specify directory where Trusted UIs tokens should be stored. (default: $BASE/signer)

Networking Options:
    --no-warp
        Disable syncing from the snapshot over the network.

    --no-discovery
        Disable new peer discovery.

    --reserved-only
        Connect only to reserved nodes.

    --no-ancient-blocks
        Disable downloading old blocks after snapshot restoration or warp sync. Not recommended.

    --no-serve-light
        Disable serving of light peers.

    --warp-barrier=[NUM]
        When warp enabled never attempt regular sync before warping to block NUM.

    --port=[PORT]
        Override the port on which the node should listen. (default: 30303)

    --interface=[IP]
        Network interfaces. Valid values are 'all', 'local' or the ip of the interface you want parity to listen to.
        (default: all)

    --min-peers=[NUM]
        Try to maintain at least NUM peers.

    --max-peers=[NUM]
        Allow up to NUM peers.

    --snapshot-peers=[NUM]
        Allow additional NUM peers for a snapshot sync. (default: 0)

    --nat=[METHOD]
        Specify method to use for determining public address. Must be one of: any, none, upnp, extip:<IP>. (default:
        any)

    --allow-ips=[FILTER]
        Filter outbound connections. Must be one of: private - connect to private network IP addresses only; public -
        connect to public network IP addresses only; all - connect to any IP address. (default: all)

    --max-pending-peers=[NUM]
        Allow up to NUM pending connections. (default: 64)

    --network-id=[INDEX]
        Override the network identifier from the chain we are on.

    --bootnodes=[NODES]
        Override the bootnodes from our chain. NODES should be comma-delimited enodes.

    --node-key=[KEY]
        Specify node secret key, either as 64-character hex string or input to SHA3 operation.

    --reserved-peers=[FILE]
        Provide a file containing enodes, one per line. These nodes will always have a reserved slot on top of the
        normal maximum peers.

API and Console Options – HTTP JSON-RPC:
    --jsonrpc-allow-missing-blocks
        RPC calls will return 'null' instead of an error if ancient block sync is still in progress and the block
        information requested could not be found

    --no-jsonrpc
        Disable the HTTP JSON-RPC API server.

    --jsonrpc-no-keep-alive
        Disable HTTP/1.1 keep alive header. Disabling keep alive will prevent re-using the same TCP connection to fire
        multiple requests, recommended when using one request per connection.

    --jsonrpc-experimental
        Enable experimental RPCs. Enable to have access to methods from unfinalised EIPs in all namespaces

    --jsonrpc-port=[PORT]
        Specify the port portion of the HTTP JSON-RPC API server. (default: 8545)

    --jsonrpc-interface=[IP]
        Specify the hostname portion of the HTTP JSON-RPC API server, IP should be an interface's IP address, or all
        (all interfaces) or local. (default: local)

    --jsonrpc-apis=[APIS]
        Specify the APIs available through the HTTP JSON-RPC interface using a comma-delimited list of API names.
        Possible names are: all, safe, debug, web3, net, eth, pubsub, personal, signer, parity, parity_pubsub,
        parity_accounts, parity_set, traces, rpc, secretstore. You can also disable a specific API by putting '-' in the
        front, example: all,-personal. 'safe' enables the following APIs: web3, net, eth, pubsub, parity, parity_pubsub,
        traces, rpc (default: web3,eth,pubsub,net,parity,private,parity_pubsub,traces,rpc,parity_transactions_pool)

    --jsonrpc-hosts=[HOSTS]
        List of allowed Host header values. This option will validate the Host header sent by the browser, it is
        additional security against some attack vectors. Special options: "all", "none",. (default: none)

    --jsonrpc-threads=[NUM]
        DEPRECATED, DOES NOTHING

    --jsonrpc-server-threads=[NUM]
        Enables multiple threads handling incoming connections for HTTP JSON-RPC server. (default: 4)

    --jsonrpc-cors=[URL]
        Specify CORS header for HTTP JSON-RPC API responses. Special options: "all", "none". (default: none)

    --jsonrpc-max-payload=[MB]
        Specify maximum size for HTTP JSON-RPC requests in megabytes.

    --poll-lifetime=[S]
        Set the RPC filter lifetime to S seconds. The filter has to be polled at least every S seconds , otherwise it is
        removed. (default: 60)

API and Console Options – WebSockets:
    --no-ws
        Disable the WebSockets JSON-RPC server.

    --ws-port=[PORT]
        Specify the port portion of the WebSockets JSON-RPC server. (default: 8546)

    --ws-interface=[IP]
        Specify the hostname portion of the WebSockets JSON-RPC server, IP should be an interface's IP address, or all
        (all interfaces) or local. (default: local)

    --ws-apis=[APIS]
        Specify the JSON-RPC APIs available through the WebSockets interface using a comma-delimited list of API names.
        Possible names are: all, safe, web3, net, eth, pubsub, personal, signer, parity, parity_pubsub, parity_accounts,
        parity_set, traces, rpc, secretstore. You can also disable a specific API by putting '-' in the front, example:
        all,-personal. 'safe' enables the following APIs: web3, net, eth, pubsub, parity, parity_pubsub, traces, rpc
        (default: web3,eth,pubsub,net,parity,parity_pubsub,private,traces,rpc,parity_transactions_pool)

    --ws-origins=[URL]
        Specify Origin header values allowed to connect. Special options: "all", "none". (default: parity://*,chrome-
        extension://*,moz-extension://*)

    --ws-hosts=[HOSTS]
        List of allowed Host header values. This option will validate the Host header sent by the browser, it is
        additional security against some attack vectors. Special options: "all", "none". (default: none)

    --ws-max-connections=[CONN]
        Maximum number of allowed concurrent WebSockets JSON-RPC connections. (default: 100)

API and Console Options – IPC:
    --no-ipc
        Disable JSON-RPC over IPC service.

    --ipc-path=[PATH]
        Specify custom path for JSON-RPC over IPC service. (default: $BASE/jsonrpc.ipc)

    --ipc-chmod=[NUM]
        Specify octal value for ipc socket permissions (unix/bsd only) (default: 660)

    --ipc-apis=[APIS]
        Specify custom API set available via JSON-RPC over IPC using a comma-delimited list of API names. Possible names
        are: all, safe, web3, net, eth, pubsub, personal, signer, parity, parity_pubsub, parity_accounts, parity_set,
        traces, rpc, secretstore. You can also disable a specific API by putting '-' in the front, example:
        all,-personal. 'safe' enables the following APIs: web3, net, eth, pubsub, parity, parity_pubsub, traces, rpc
        (default: web3,eth,pubsub,net,parity,parity_pubsub,parity_accounts,private,traces,rpc,parity_transactions_pool)

Light Client Options:
    --on-demand-time-window=[S]
        Specify the maximum time to wait for a successful response

    --on-demand-start-backoff=[S]
        Specify light client initial backoff time for a request

    --on-demand-end-backoff=[S]
        Specify light client maximum backoff time for a request

    --on-demand-max-backoff-rounds=[TIMES]
        Specify light client maximum number of backoff iterations for a request

    --on-demand-consecutive-failures=[TIMES]
        Specify light client the number of failures for a request until it gets exponentially backed off

Secret Store Options:
    --no-secretstore
        Disable Secret Store functionality.

    --no-secretstore-http
        Disable Secret Store HTTP API.

    --no-secretstore-auto-migrate
        Do not run servers set change session automatically when servers set changes. This option has no effect when
        servers set is read from configuration file.

    --secretstore-http-cors=[URL]
        Specify CORS header for Secret Store HTTP API responses. Special options: "all", "none". (default: none)

    --secretstore-acl-contract=[SOURCE]
        Secret Store permissioning contract address source: none, registry (contract address is read from
        'secretstore_acl_checker' entry in registry) or address. (default: registry)

    --secretstore-contract=[SOURCE]
        Secret Store Service contract address source: none, registry (contract address is read from
        'secretstore_service' entry in registry) or address.

    --secretstore-srv-gen-contract=[SOURCE]
        Secret Store Service server key generation contract address source: none, registry (contract address is read
        from 'secretstore_service_srv_gen' entry in registry) or address.

    --secretstore-srv-retr-contract=[SOURCE]
        Secret Store Service server key retrieval contract address source: none, registry (contract address is read from
        'secretstore_service_srv_retr' entry in registry) or address.

    --secretstore-doc-store-contract=[SOURCE]
        Secret Store Service document key store contract address source: none, registry (contract address is read from
        'secretstore_service_doc_store' entry in registry) or address.

    --secretstore-doc-sretr-contract=[SOURCE]
        Secret Store Service document key shadow retrieval contract address source: none, registry (contract address is
        read from 'secretstore_service_doc_sretr' entry in registry) or address.

    --secretstore-nodes=[NODES]
        Comma-separated list of other secret store cluster nodes in form NODE_PUBLIC_KEY_IN_HEX@NODE_IP_ADDR:NODE_PORT.
        (default:)

    --secretstore-server-set-contract=[SOURCE]
        Secret Store server set contract address source: none, registry (contract address is read from
        'secretstore_server_set' entry in registry) or address. (default: registry)

    --secretstore-interface=[IP]
        Specify the hostname portion for listening to Secret Store Key Server internal requests, IP should be an
        interface's IP address, or local. (default: local)

    --secretstore-port=[PORT]
        Specify the port portion for listening to Secret Store Key Server internal requests. (default: 8083)

    --secretstore-http-interface=[IP]
        Specify the hostname portion for listening to Secret Store Key Server HTTP requests, IP should be an interface's
        IP address, or local. (default: local)

    --secretstore-http-port=[PORT]
        Specify the port portion for listening to Secret Store Key Server HTTP requests. (default: 8082)

    --secretstore-path=[PATH]
        Specify directory where Secret Store should save its data. (default: $BASE/secretstore)

    --secretstore-secret=[SECRET]
        Hex-encoded secret key of this node.

    --secretstore-admin=[PUBLIC]
        Hex-encoded public key of secret store administrator.

Sealing/Mining Options:
    --force-sealing
        Force the node to author new blocks as if it were always sealing/mining.

    --reseal-on-uncle
        Force the node to author new blocks when a new uncle block is imported.

    --remove-solved
        Move solved blocks from the work package queue instead of cloning them. This gives a slightly faster import
        speed, but means that extra solutions submitted for the same work package will go unused.

    --tx-queue-no-unfamiliar-locals
        Local transactions sent through JSON-RPC (HTTP, WebSockets, etc) will be treated as 'external' if the sending
        account is unknown.

    --tx-queue-no-early-reject
        Disables transaction queue optimization to early reject transactions below minimal effective gas price. This
        allows local transactions to always enter the pool, despite it being full, but requires additional ecrecover on
        every transaction.

    --refuse-service-transactions
        Always refuse service transactions.

    --infinite-pending-block
        Pending block will be created with maximal possible gas limit and will execute all transactions in the queue.
        Note that such block is invalid and should never be attempted to be mined.

    --no-persistent-txqueue
        Don't save pending local transactions to disk to be restored whenever the node restarts.

    --stratum
        Run Stratum server for miner push notification.

    --reseal-on-txs=[SET]
        Specify which transactions should force the node to reseal a block. SET is one of: none - never reseal on new
        transactions; own - reseal only on a new local transaction; ext - reseal only on a new external transaction; all
        - reseal on all new transactions. (default: own)

    --reseal-min-period=[MS]
        Specify the minimum time between reseals from incoming transactions. MS is time measured in milliseconds.
        (default: 2000)

    --reseal-max-period=[MS]
        Specify the maximum time since last block to enable force-sealing. MS is time measured in milliseconds.
        (default: 120000)

    --work-queue-size=[ITEMS]
        Specify the number of historical work packages which are kept cached lest a solution is found for them later.
        High values take more memory but result in fewer unusable solutions. (default: 20)

    --relay-set=[SET]
        Set of transactions to relay. SET may be: cheap - Relay any transaction in the queue (this may include invalid
        transactions); strict - Relay only executed transactions (this guarantees we don't relay invalid transactions,
        but means we relay nothing if not mining); lenient - Same as strict when mining, and cheap when not. (default:
        cheap)

    --usd-per-tx=[USD]
        Amount of USD to be paid for a basic transaction. The minimum gas price is set accordingly. (default: 0.0001)

    --usd-per-eth=[SOURCE]
        USD value of a single ETH. SOURCE may be either an amount in USD, a web service or 'auto' to use each web
        service in turn and fallback on the last known good value. (default: auto)

    --price-update-period=[T]
        T will be allowed to pass between each gas price update. T may be daily, hourly, a number of seconds, or a time
        string of the form "2 days", "30 minutes" etc.. (default: hourly)

    --gas-floor-target=[GAS]
        Amount of gas per block to target when sealing a new block. (default: 8000000)

    --gas-cap=[GAS]
        A cap on how large we will raise the gas limit per block due to transaction volume. (default: 10000000)

    --tx-queue-mem-limit=[MB]
        Maximum amount of memory that can be used by the transaction queue. Setting this parameter to 0 disables
        limiting. (default: 4)

    --tx-queue-size=[LIMIT]
        Maximum amount of transactions in the queue (waiting to be included in next block). (default: 8192)

    --tx-queue-per-sender=[LIMIT]
        Maximum number of transactions per sender in the queue. By default it's 1% of the entire queue, but not less
        than 16.

    --tx-queue-locals=[ACCOUNTS]
        Specify local accounts for which transactions are prioritized in the queue. ACCOUNTS is a comma-delimited list
        of addresses.

    --tx-queue-strategy=[S]
        Prioritization strategy used to order transactions in the queue. S may be: gas_price - Prioritize txs with high
        gas price (default: gas_price)

    --stratum-interface=[IP]
        Interface address for Stratum server. (default: local)

    --stratum-port=[PORT]
        Port for Stratum server to listen on. (default: 8008)

    --min-gas-price=[STRING]
        Minimum amount of Wei per GAS to be paid for a transaction to be accepted for mining. Overrides --usd-per-tx.

    --gas-price-percentile=[PCT]
        Set PCT percentile gas price value from last 100 blocks as default gas price when sending transactions.
        (default: 50)

    --author=[ADDRESS]
        Specify the block author (aka "coinbase") address for sending block rewards from sealed blocks. NOTE: MINING
        WILL NOT WORK WITHOUT THIS OPTION.

    --engine-signer=[ADDRESS]
        Specify the address which should be used to sign consensus messages and issue blocks. Relevant only to non-PoW
        chains.

    --tx-gas-limit=[GAS]
        Apply a limit of GAS as the maximum amount of gas a single transaction may have for it to be mined.

    --tx-time-limit=[MS]
        Maximal time for processing single transaction. If enabled senders of transactions offending the limit will get
        other transactions penalized.

    --extra-data=[STRING]
        Specify a custom extra-data for authored blocks, no more than 32 characters.

    --notify-work=[URLS]
        URLs to which work package notifications are pushed. URLS should be a comma-delimited list of HTTP URLs.

    --stratum-secret=[STRING]
        Secret for authorizing Stratum server for peers.

    --max-round-blocks-to-import=[S]
        Maximal number of blocks to import for each import round. (default: 12)

Internal Options:
    --can-restart
        Executable will auto-restart if exiting with 69

Miscellaneous Options:
    --no-color
        Don't use terminal color codes in output.

    -v, --version
        Show information about version.

    --no-config
        Don't load a configuration file.

    -l, --logging=[LOGGING]
        Specify the general logging level (error, warn, info, debug or trace). It can also be set for a specific module,
        example: '-l sync=debug,rpc=trace'

    --log-file=[FILENAME]
        Specify a filename into which logging should be appended.

Footprint Options:
    --scale-verifiers
        Automatically scale amount of verifier threads based on workload. Not guaranteed to be faster.

    --tracing=[BOOL]
        Indicates if full transaction tracing should be enabled. Works only if client had been fully synced with tracing
        enabled. BOOL may be one of auto, on, off. auto uses last used value of this option (off if it does not exist).
        (default: auto)

    --pruning=[METHOD]
        Configure pruning of the state/storage trie. METHOD may be one of auto, archive, fast: archive - keep all state
        trie data. No pruning. fast - maintain journal overlay. Fast but 50MB used. auto - use the method most recently
        synced or default to fast if none synced. (default: auto)

    --pruning-history=[NUM]
        Set a minimum number of recent states to keep in memory when pruning is active. (default: 128)

    --pruning-memory=[MB]
        The ideal amount of memory in megabytes to use to store recent states. As many states as possible will be kept
        within this limit, and at least --pruning-history states will always be kept. (default: 64)

    --cache-size-db=[MB]
        Override database cache size. (default: 128)

    --cache-size-blocks=[MB]
        Specify the preferred size of the blockchain cache in megabytes. (default: 8)

    --cache-size-queue=[MB]
        Specify the maximum size of memory to use for block queue. (default: 40)

    --cache-size-state=[MB]
        Specify the maximum size of memory to use for the state cache. (default: 25)

    --db-compaction=[TYPE]
        Database compaction type. TYPE may be one of: ssd - suitable for SSDs and fast HDDs; hdd - suitable for slow
        HDDs; auto - determine automatically. (default: auto)

    --fat-db=[BOOL]
        Build appropriate information to allow enumeration of all accounts and storage keys. Doubles the size of the
        state database. BOOL may be one of on, off or auto. (default: auto)

    --cache-size=[MB]
        Set total amount of discretionary memory to use for the entire system, overrides other cache and queue options.

    --num-verifiers=[INT]
        Amount of verifier threads to use or to begin with, if verifier auto-scaling is enabled.

Import/export Options:
    --no-seal-check
        Skip block seal check.

Snapshot Options:
    --no-periodic-snapshot
        Disable automated snapshots which usually occur once every 5000 blocks.

    --snapshot-threads=[NUM]
        Enables multiple threads for snapshots creation.

Whisper Options:
    --whisper
        Does nothing. Whisper has been moved to https://github.com/paritytech/whisper

    --whisper-pool-size=[MB]
        Does nothing. Whisper has been moved to https://github.com/paritytech/whisper

```

`---EOF---`