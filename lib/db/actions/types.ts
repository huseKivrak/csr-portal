export type ServerAction =
	| {
			success: true;
			data: Record<string, any> | Record<string, any>[];
	  }
	| {
			success: false;
			errors: Record<string, string[]>;
	  };
