import { Request, StatusCode, UploadedFile } from "../../../index";

function coverFile(file: UploadedFile | UploadedFile[] | undefined): UploadedFile | undefined {
    if (!file) {
        return undefined;
    }
    return Array.isArray(file) ? file[0] : file;
}

export function uploadCoverController(req: Request) {
    const cover = coverFile(req.files.cover);
    if (!cover) {
        return {
            status: StatusCode.BadRequest,
            body: { message: "Cover file is required" },
        };
    }

    return {
        status: StatusCode.Created,
        body: {
            message: "Cover uploaded",
            bookId: req.params.id,
            caption: req.body.caption,
            cover: {
                filename: cover.filename,
                mediaType: cover.mediaType,
                size: cover.data.length,
            },
        },
    };
}
