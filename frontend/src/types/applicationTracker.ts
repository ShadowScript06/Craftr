export interface Application {
  id: string;
  role: string;
  company: string;
  location: string;
  status: string;
  date: string;
  salary: string;
  starred: boolean;
  appliedAt: string;
}

export interface StatusConfig {
  label: string;
  pill: string;
}

export interface LogoPalette {
  bg: string;
  color: string;
}

export interface FormState {
  role: string;
  company: string;
  location: string;
  salary: string;
  status: string;
  source?: string;
  link?: string;
}

export interface FieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  setValue: (newValue: string) => void;
}


