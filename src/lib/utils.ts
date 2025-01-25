
// helper for displaying how long ago a post was made in feed
export function timeAgo(inputDate: Date): string {
    const date = typeof inputDate === "string" ? new Date(inputDate) : inputDate;

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
    const intervals: { [key: string]: number } = {
      year: 60 * 60 * 24 * 365,
      month: 60 * 60 * 24 * 30,
      day: 60 * 60 * 24,
      hour: 60 * 60,
      minute: 60,
    };
  
    if (seconds >= intervals.year) {
      const years = Math.floor(seconds / intervals.year);
      return `${years}yr`;
    } else if (seconds >= intervals.month) {
      const months = Math.floor(seconds / intervals.month);
      return `${months}mo`;
    } else if (seconds >= intervals.day) {
      const days = Math.floor(seconds / intervals.day);
      return `${days}d`;
    } else if (seconds >= intervals.hour) {
      const hours = Math.floor(seconds / intervals.hour);
      return `${hours}h`;
    } else if (seconds >= intervals.minute) {
      const minutes = Math.floor(seconds / intervals.minute);
      return `${minutes}m`;
    } else {
      return "just now";
    }
  }
  

export  function formatReadableDate(inputDate: Date): string {
    const date = typeof inputDate === "string" ? new Date(inputDate) : inputDate;

    const options: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };

    // Format date and time
    const formatter = new Intl.DateTimeFormat('en-US', options);
    return formatter.format(date).replace(',', ' at');
}

export function checkForAliasMismatch(alias: string, dataAlias: string) {
    if (alias !== dataAlias || window.location.pathname.replace("/project/", "") !== dataAlias) {
        return true;
    }

    return false;
}