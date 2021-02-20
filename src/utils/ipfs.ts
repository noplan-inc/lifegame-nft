import IPFS from 'ipfs';

export const uploadIpfs = async (
    params: any,
    node: IPFS.IPFS
): Promise<string> => {
    const result = await node.add(params);
    return `https://ipfs.io/ipfs/${result.path}`;
};
