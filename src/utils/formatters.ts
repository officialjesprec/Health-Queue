export const formatStatus = (status: string) => {
    if (!status) return '';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const formatStage = (stage: string) => {
    if (!stage) return '';
    return stage.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};
