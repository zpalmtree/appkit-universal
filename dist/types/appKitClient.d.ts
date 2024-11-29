import type { LibraryOptions } from '@web3modal/scaffold';
import { Web3ModalScaffold } from '@web3modal/scaffold';
import { type ConnectParams, UniversalProvider } from '@walletconnect/universal-provider';
export type Web3ModalClientOptions = Omit<LibraryOptions, 'defaultChain' | 'tokens' | '_sdkVersion'> & {
    universalProvider: Awaited<ReturnType<(typeof UniversalProvider)['init']>>;
    namespaces: Exclude<ConnectParams['optionalNamespaces'], undefined>;
    chainImages?: Record<number | string, string>;
};
export type Web3ModalOptions = Omit<Web3ModalClientOptions, '_sdkVersion'>;
export declare class WalletConnectModal extends Web3ModalScaffold {
    private hasSyncedConnectedAccount;
    private options;
    private universalProvider;
    private requestedScope;
    private requestedNamespaces;
    private _onSyncAccount;
    constructor(options: Web3ModalClientOptions);
    disconnect(): Promise<void>;
    private syncAccount;
    private syncNetwork;
}
//# sourceMappingURL=appKitClient.d.ts.map