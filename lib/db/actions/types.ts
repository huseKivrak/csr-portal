import { UserDetail } from '@/db/types';

export type ServerAction =
	| {
			success: true;
			data: Record<string, any> | Record<string, any>[];
	  }
	| {
			success: false;
			errors: Record<string, string[]>;
	  };

export type SearchAction = {
	id: string;
	label: string;
	value: string;
	description: string;
	icon: React.ReactNode;
	hotkey: string;
} & (
	| {
			isRedirect?: true;
			redirectUrl: string;
	  }
	| {
			isRedirect?: false;
	  }
);

export type CSRFormProps = {
	userDetail: UserDetail;
	onSuccess?: () => void;
};
