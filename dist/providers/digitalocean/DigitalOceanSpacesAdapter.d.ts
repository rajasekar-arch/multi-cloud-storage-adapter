import { AwsS3Adapter } from '../aws/AwsS3Adapter';
import { DigitalOceanSpacesConfig } from './types';
export declare class DigitalOceanSpacesAdapter extends AwsS3Adapter {
    constructor(config: DigitalOceanSpacesConfig);
}
