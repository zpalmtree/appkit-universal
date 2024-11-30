import { Web3ModalScaffold } from '@web3modal/scaffold';
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils';
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common';
import { ApiController, OptionsController } from '@web3modal/core';
// -- Client --------------------------------------------------------------------
export class WalletConnectModal extends Web3ModalScaffold {
    hasSyncedConnectedAccount = false;
    options = undefined;
    universalProvider;
    requestedScope;
    requestedNamespaces;
    _onSyncAccount;
    constructor(options) {
        const { universalProvider, namespaces, ...w3mOptions } = options;
        if (!universalProvider) {
            throw new Error('web3modal:constructor - universalProvider is undefined');
        }
        if (!w3mOptions.projectId) {
            throw new Error('web3modal:constructor - projectId is undefined');
        }
        OptionsController.setProjectId(w3mOptions.projectId);
        const networkControllerClient = {
            switchCaipNetwork: async (caipNetwork) => {
                if (caipNetwork) {
                    this.universalProvider.setDefaultChain(caipNetwork.id);
                }
            },
            //@ts-ignore - doesn't need to be async
            getApprovedCaipNetworksData: () => {
                //@ts-ignore
                const accounts = this.universalProvider?.session?.namespaces[this.requestedScope].accounts;
                const chains = accounts?.map((account) => `${this.requestedScope}:` + account.split(':')[1]);
                return {
                    supportsAllNetworks: false,
                    approvedCaipNetworkIds: chains,
                };
            },
        };
        //@ts-ignore no signMessage here...
        const connectionControllerClient = {
            connectWalletConnect: async (onUri) => {
                this.universalProvider.events.on('display_uri', onUri);
                await this.universalProvider.connect({ optionalNamespaces: this.requestedNamespaces });
                this.universalProvider.removeListener('display_uri', onUri);
                this.syncAccount();
            },
            disconnect: async () => {
                await this.universalProvider.disconnect();
                this.syncAccount();
            },
        };
        super({
            networkControllerClient,
            connectionControllerClient,
            featuredWalletIds: [],
            allowUnsupportedChain: true,
            chain: CommonConstantsUtil.CHAIN.EVM,
            isUniversalProvider: true,
            //@ts-ignore version type
            _sdkVersion: `universal-appkit-solana-adapter-${ConstantsUtil.VERSION}`,
            ...{
                enableOnramp: false,
                ...w3mOptions,
            },
        });
        this.options = options;
        this.requestedScope = Object.keys(namespaces)[0];
        this.requestedNamespaces = namespaces;
        this.universalProvider = universalProvider;
        const id = 'walletConnect';
        this.setConnectors([
            {
                id,
                explorerId: PresetsUtil.ConnectorExplorerIds[id],
                name: PresetsUtil.ConnectorNamesMap[id],
                imageId: PresetsUtil.ConnectorImageIds[id],
                type: PresetsUtil.ConnectorTypesMap[id],
                info: {
                    rdns: id,
                },
                chain: CommonConstantsUtil.CHAIN.EVM,
            },
        ]);
        this.syncAccount();
        this.syncNetwork();
        this._onSyncAccount = this.syncAccount.bind(this);
        universalProvider.client.on('session_update', this._onSyncAccount);
        universalProvider.client.on('session_delete', this._onSyncAccount);
    }
    async disconnect() {
        await this.universalProvider.disconnect();
        this.syncAccount();
    }
    // -- Private -----------------------------------------------------------------
    async syncAccount() {
        this.resetAccount();
        const session = this.universalProvider.session;
        if (session) {
            const connectedScope = Object.keys(session.namespaces)[0];
            const chainId = session.namespaces?.[connectedScope]?.accounts[0].split(':')[1];
            this.setIsConnected(true);
            this.setCaipAddress(session.namespaces?.[connectedScope]?.accounts[0]);
            this.setCaipNetwork({
                id: (connectedScope + chainId),
                name: connectedScope,
                imageId: PresetsUtil.EIP155NetworkImageIds[chainId],
                imageUrl: this.options?.chainImages?.[chainId],
                chain: CommonConstantsUtil.CHAIN.EVM,
            });
            this.hasSyncedConnectedAccount = true;
        }
        else if (this.hasSyncedConnectedAccount) {
            this.resetWcConnection();
            this.resetNetwork();
        }
    }
    syncNetwork() {
        const chainId = this.requestedNamespaces[this.requestedScope].chains[0];
        this.setCaipNetwork({
            id: chainId,
            name: this.requestedScope,
            imageId: PresetsUtil.EIP155NetworkImageIds[chainId],
            imageUrl: this.options?.chainImages?.[chainId],
            chain: CommonConstantsUtil.CHAIN.EVM,
        });
        ApiController.reFetchWallets();
    }
}
//# sourceMappingURL=appKitClient.js.map